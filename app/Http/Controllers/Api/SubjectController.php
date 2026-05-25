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
            $subject = Subject::where('user_id', $request->user()->id)->findOrFail($id);

            // 1. Traemos los datos crudos (igual que tu compañero)
            $records = \DB::table('student_subject')
                ->join('students', 'student_subject.student_id', '=', 'students.id')
                ->leftJoin('grades', function($join) use ($id) {
                    $join->on('students.id', '=', 'grades.student_id')
                         ->where('grades.subject_id', '=', $id);
                })
                ->where('student_subject.subject_id', $id)
                ->whereNull('students.deleted_at')
                ->select(
                    'students.id as student_id',
                    'students.first_name',
                    'students.last_name',
                    'students.identifier',
                    'grades.description as activity_name',
                    'grades.score'
                )
                ->orderBy('students.last_name', 'asc')
                ->get();

            // 2. Extraemos los nombres de las actividades únicas (Serán nuestras columnas dinámicas)
            $activities = $records->whereNotNull('activity_name')->pluck('activity_name')->unique()->values()->toArray();
            
            // 3. Agrupamos los datos por alumno para que no se repitan los nombres
            $groupedStudents = $records->groupBy('student_id');

            // Empezamos a armar el Excel
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

            // --- ENCABEZADOS DE LA TABLA PIVOTE ---
            $headers = ['Matrícula', 'Apellido', 'Nombre'];
            foreach ($activities as $activity) {
                $headers[] = $activity; // Agregamos una columna por cada examen/tarea
            }
            $headers[] = 'Promedio Final'; // Última columna
            
            $sheet->fromArray($headers, NULL, 'A5');
            
            // Calculamos cuál es la última columna (ej. 'E', 'F', 'G') según la cantidad de actividades
            $lastColLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex(count($headers));
            
            $headerStyle = [
                'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => ['fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID, 'startColor' => ['rgb' => '4F46E5']],
                'alignment' => ['horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER],
            ];
            $sheet->getStyle('A5:' . $lastColLetter . '5')->applyFromArray($headerStyle);

            // --- LLENAR LOS DATOS DE LOS ALUMNOS (UNA FILA POR ALUMNO) ---
            $row = 6;
            $classTotalSum = 0;
            $classTotalCount = 0;

            foreach ($groupedStudents as $studentId => $studentRecords) {
                $firstRecord = $studentRecords->first(); // Tomamos los datos base del alumno
                
                $rowData = [
                    $firstRecord->identifier ?? 'N/A',
                    $firstRecord->last_name,
                    $firstRecord->first_name
                ];

                $studentTotalScore = 0;
                $studentGradesCount = 0;

                // Buscamos si el alumno tiene calificación para cada columna de actividad
                foreach ($activities as $activity) {
                    $grade = $studentRecords->firstWhere('activity_name', $activity);
                    
                    if ($grade && !is_null($grade->score)) {
                        $rowData[] = number_format($grade->score, 2);
                        $studentTotalScore += $grade->score;
                        $studentGradesCount++;
                        
                        // Para el promedio de todo el grupo
                        $classTotalSum += $grade->score;
                        $classTotalCount++;
                    } else {
                        $rowData[] = '-'; // Si no entregó esa tarea, ponemos un guión
                    }
                }

                // Columna Final: Promedio del alumno
                if ($studentGradesCount > 0) {
                    $rowData[] = number_format($studentTotalScore / $studentGradesCount, 2);
                } else {
                    $rowData[] = '0.00';
                }

                // Insertamos la fila completa en el Excel
                $sheet->fromArray($rowData, NULL, 'A' . $row);
                $row++;
            }

            // --- FILA DE PROMEDIO GENERAL DE LA CLASE ---
            if ($classTotalCount > 0) {
                $row++; 
                $sheet->setCellValue('C' . $row, 'PROMEDIO GENERAL DEL GRUPO:');
                $sheet->getStyle('C' . $row)->getFont()->setBold(true);
                $sheet->getStyle('C' . $row)->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_RIGHT);

                $finalAverage = $classTotalSum / $classTotalCount;
                $sheet->setCellValue($lastColLetter . $row, number_format($finalAverage, 2));
                
                $sheet->getStyle($lastColLetter . $row)->getFont()->setBold(true);
                $sheet->getStyle($lastColLetter . $row)->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
                $sheet->getStyle($lastColLetter . $row)->getFill()->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)->getStartColor()->setRGB('E0E7FF');
            }

            // Auto-ajustar el ancho de todas las columnas dinámicas
            foreach (range(1, count($headers)) as $colIndex) {
                $colLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colIndex);
                $sheet->getColumnDimension($colLetter)->setAutoSize(true);
            }

            // --- CABECERAS HTTP PARA DESCARGA ---
            $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);
            $fileName = 'Reporte_' . str_replace(' ', '_', $subject->name) . '_' . date('Ymd') . '.xlsx';
            
            header('Access-Control-Allow-Origin: http://localhost:5173'); 
            header('Access-Control-Allow-Credentials: true');
            header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
            header('Access-Control-Allow-Headers: Content-Type, Authorization, Accept, X-Requested-With');
            header('Access-Control-Expose-Headers: Content-Disposition');
            header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            header('Content-Disposition: attachment;filename="' . $fileName . '"');
            header('Cache-Control: max-age=0');
            
            if (ob_get_contents()) ob_end_clean();
            $writer->save('php://output');
            exit;

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Materia no encontrada.'], 404);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al generar el archivo Excel.', 'error' => $e->getMessage()], 500);
        }
    }
    
}