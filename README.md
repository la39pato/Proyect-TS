1- registrar estudiantes : registro ,edicion , delete, cambiar estado ( activo , inactivo ) , list in table.
datos: { id , nombre , correo , edad , carrera , estado}

2- registrar clases : registro , edicion , delete , cambiar estado ( disponible , cerrado ), list in table.
datos: { id , nombre , sigla , docente , cupo maximo, cupo actual , estado }

3- asignar estudiantes - clases : inscripcion( estudiante , curso ) -> evitar ( duplicados , if ( curso = cerrado ) , if ( estudiante = inactivo ) , if ( cupo_actual<= cupo_maximo ))
datos: {id,estudiante_id, curso_id , fecha , estado_inscripcion }

4- mostrar lista : mostrar_cursos_estudiante , mostrar_estudiantes_curso , estudiantes_nombre , cursos_nombre ,cursos_sigla  , estudiantes_activos , estudiantes_inactivos , cursos_disponibles , cursos_cerrados.

5- generar estadisticas simples : total_estudiantes, total_cursos , total_inscripciones , curso_mas_estudiantes , total_estudiantes_activos , total_cursos_cerrados.

tecnisismos : campos_vacios , email_valido , edad_Valida , no duplicar correos , sigla no duplicado , no repetir inscripcion . 

