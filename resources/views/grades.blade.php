<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Reporte de Calificaciones</title>
    <style>
        body { font-family: sans-serif; color: #333; }
        .header { text-align: center; margin-bottom: 30px; }
        .title { font-size: 24px; color: #4f46e5; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        th { background-color: #f3f4f6; color: #374151; }
        .score { font-weight: bold; text-align: right; }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">DocenteAI - Reporte Escolar</div>
        <p><strong>Materia:</strong> {{ $subject->name }} | <strong>Fecha:</strong> {{ $date }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Matrícula</th>
                <th>Alumno</th>
                <th>Actividad / Descripción</th>
                <th>Calificación</th>
            </tr>
        </thead>
        <tbody>
            @foreach($grades as $grade)
            <tr>
                <td>{{ $grade->student->identifier ?? 'N/A' }}</td>
                <td>{{ $grade->student->last_name }}, {{ $grade->student->first_name }}</td>
                <td>{{ $grade->description }}</td>
                <td class="score">{{ number_format($grade->score, 1) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>