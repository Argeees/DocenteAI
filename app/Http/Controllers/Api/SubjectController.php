<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;

class SubjectController extends Controller
{
    // Método index ÚNICO y actualizado (trae las materias con sus alumnos)
    public function index(Request $request)
    {
        $subjects = Subject::with('students')->where('user_id', $request->user()->id)->latest()->get();
        return response()->json(['success' => true, 'data' => $subjects]);
    }

    public function store(Request $request)
    {
        $request->validate(['name' => 'required|string|max:255', 'color' => 'nullable|string']);

        $subject = Subject::create([
            'user_id' => $request->user()->id,
            'name' => $request->name,
            'color' => $request->color ?? '#4f46e5',
        ]);

        return response()->json(['success' => true, 'data' => $subject], 201);
    }

    public function update(Request $request, Subject $subject)
    {
        if ($subject->user_id !== $request->user()->id) return response()->json(['message' => 'No autorizado'], 403);

        $request->validate(['name' => 'required|string|max:255', 'color' => 'nullable|string']);
        $subject->update($request->only(['name', 'color']));

        return response()->json(['success' => true, 'data' => $subject]);
    }
    
    // Inscribe o actualiza los alumnos de una materia
    public function syncStudents(Request $request, Subject $subject)
    {
        // Verificamos que la materia sea de este maestro
        if ($subject->user_id !== $request->user()->id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $request->validate([
            'student_ids' => 'array' // Esperamos una lista de IDs: [1, 5, 8]
        ]);

        // La función sync() inscribe a los alumnos de la lista y desinscribe a los que no estén
        $subject->students()->sync($request->student_ids);

        return response()->json([
            'success' => true, 
            'message' => 'Alumnos actualizados correctamente'
        ]);
    }

    public function destroy(Request $request, Subject $subject)
    {
        if ($subject->user_id !== $request->user()->id) return response()->json(['message' => 'No autorizado'], 403);
        $subject->delete();
        return response()->json(['success' => true, 'message' => 'Eliminada']);
    }

    /**
     * Exporta el listado de alumnos, actividades y calificaciones de una materia a Excel.
     * Adaptado rigurosamente para Axios con withCredentials: true.
     */
    public function exportExcel(Request $request, $id)
    {
        try {
            // 1. Validar seguridad: que la materia pertenezca al docente autenticado
            $subject = Subject::where('user_id', $request->user()->id)->findOrFail($id);

            // 2. Consulta con LeftJoin: Listar alumnos inscritos aunque no tengan notas registradas aún
            $records = \DB::table('student_subject')
                ->join('students', 'student_subject.student_id', '=', 'students.id')
                ->leftJoin('grades', function($join) use ($id) {
                    $join->on('students.id', '=', 'grades.student_id')
                         ->where('grades.subject_id', '=', $id);
                })
                ->where('student_subject.subject_id', $id)
                ->whereNull('students.deleted_at') // Ignorar alumnos borrados por softDeletes
                ->select(
                    'students.first_name',
                    'students.last_name',
                    'students.identifier',
                    'grades.description as activity_name',
                    'grades.score'
                )
                ->orderBy('students.last_name', 'asc')
                ->get();

            // 3. Crear el libro de trabajo de Excel usando PhpSpreadsheet
            $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
            $sheet = $spreadsheet->getActiveSheet();
            $sheet->setTitle('Lista y Calificaciones');

            // --- DISEÑO Y ESTILOS ---
            $sheet->setCellValue('A1', 'REPORTE OFICIAL DE CALIFICACIONES');
            $sheet->setCellValue('A2', 'Materia: ' . $subject->name);
            $sheet->setCellValue('A3', 'Fecha de generación: ' . now()->format('d/m/Y H:i'));
            
            $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(16);
            $sheet->getStyle('A2')->getFont()->setBold(true)->setSize(12);
            $sheet->getStyle('A3')->getFont()->setItalic(true)->setSize(10);

            // Encabezados de la tabla
            $headers = ['Matrícula', 'Apellido', 'Nombre', 'Actividad / Evaluación', 'Calificación'];
            $sheet->fromArray($headers, NULL, 'A5');
            
            $headerStyle = [
                'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID, 
                    'startColor' => ['rgb' => '4F46E5'] // Indigo institucional
                ],
                'alignment' => ['horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER],
            ];
            $sheet->getStyle('A5:E5')->applyFromArray($headerStyle);

            // 4. Llenar el Excel con los registros obtenidos
            $row = 6;
            $totalScores = 0;
            $scoresCount = 0;

            foreach ($records as $record) {
                $sheet->setCellValue('A' . $row, $record->identifier ?? 'N/A');
                $sheet->setCellValue('B' . $row, $record->last_name);
                $sheet->setCellValue('C' . $row, $record->first_name);
                
                // Si tiene actividad registrada la pone, si no, deja un indicador limpio
                $sheet->setCellValue('D' . $row, $record->activity_name ?? 'Sin actividades evaluadas');
                
                if (!is_null($record->score)) {
                    $sheet->setCellValue('E' . $row, number_format($record->score, 2));
                    $totalScores += $record->score;
                    $scoresCount++;
                } else {
                    $sheet->setCellValue('E' . $row, '-');
                }
                
                $sheet->getStyle('E' . $row)->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
                $row++;
            }

            // 5. Agregar Fila de Promedio General de la Materia (si existen notas)
            if ($scoresCount > 0) {
                $row++; 
                $sheet->setCellValue('C' . $row, 'PROMEDIO GENERAL DE LA MATERIA:');
                $sheet->getStyle('C' . $row)->getFont()->setBold(true);
                $sheet->getStyle('C' . $row)->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_RIGHT);

                $finalAverage = $totalScores / $scoresCount;
                $sheet->setCellValue('E' . $row, number_format($finalAverage, 2));
                
                $sheet->getStyle('E' . $row)->getFont()->setBold(true);
                $sheet->getStyle('E' . $row)->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
                $sheet->getStyle('E' . $row)->getFill()->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)->getStartColor()->setRGB('E0E7FF');
            }

            // Auto-ajustar ancho de columnas
            foreach (range('A', 'E') as $col) {
                $sheet->getColumnDimension($col)->setAutoSize(true);
            }

            // 6. Cabeceras HTTP estrictas para Axios con withCredentials: true
            $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);
            $fileName = 'Reporte_' . str_replace(' ', '_', $subject->name) . '_' . date('Ymd') . '.xlsx';
            
            // ATENCIÓN: Reemplaza http://localhost:5173 por el puerto exacto de tu React si es distinto
            header('Access-Control-Allow-Origin: http://localhost:5173'); 
            header('Access-Control-Allow-Credentials: true'); // Vital para que tu axios.js no sea bloqueado
            header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
            header('Access-Control-Allow-Headers: Content-Type, Authorization, Accept, X-Requested-With');
            header('Access-Control-Expose-Headers: Content-Disposition');

            header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            header('Content-Disposition: attachment;filename="' . $fileName . '"');
            header('Cache-Control: max-age=0');
            
            // Limpiar buffers para evitar que se corrompa el binario .xlsx
            if (ob_get_contents()) ob_end_clean();
            
            $writer->save('php://output');
            exit;

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Materia no encontrada o no autorizada.'], 404);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al generar el archivo Excel.', 'error' => $e->getMessage()], 500);
        }
    }
}