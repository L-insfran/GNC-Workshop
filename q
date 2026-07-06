[33mcommit a7e857b14ba06be850e585a852e8bbf1de009cfc[m[33m ([m[1;36mHEAD[m[33m -> [m[1;32mmain[m[33m, [m[1;31morigin/main[m[33m)[m
Author: Leandro Insfrán <leandro.insfran@systelec.com>
Date:   Mon Jul 6 14:36:32 2026 -0300

    fix: selector de vehiculo en OT y marca/modelo en tabla
    
    Serializa marcaNombre/modeloNombre en API de vehiculos, corrige selects controlados en orden de trabajo y habilita opciones del componente Select.
    
    Co-authored-by: Cursor <cursoragent@cursor.com>

[33mcommit 86f65dab50defc42a5f4b9e13c33764766b0725f[m
Author: Leandro Insfrán <leandro.insfran@systelec.com>
Date:   Mon Jul 6 14:20:59 2026 -0300

    fix: corregir Table en paginas de usuarios y categorias
    
    Agrega keyExtractor obligatorio y props de estado vacio para evitar el crash al abrir Configuracion -> Usuarios.
    
    Co-authored-by: Cursor <cursoragent@cursor.com>

[33mcommit 2e4e1b598458146b7a3f79b105a0336ecfd98c84[m
Author: Leandro Insfrán <leandro.insfran@systelec.com>
Date:   Mon Jul 6 14:13:53 2026 -0300

    ultimos cambios

[33mcommit 939859612f6e49dd558517eb3c3a7c740befcb9a[m
Author: Leandro Insfrán <leandro.insfran@systelec.com>
Date:   Sun Jul 5 01:59:38 2026 -0300

    feat: modulos post-MVP Inventario, Caja, Facturacion y Agenda
    
    Co-authored-by: Cursor <cursoragent@cursor.com>

[33mcommit d077630d15faa0b96681b6ea21f83e188bd01697[m
Author: Leandro Insfrán <leandro.insfran@systelec.com>
Date:   Sun Jul 5 01:31:38 2026 -0300

    fix: alta equipos GNC con insert SQL directo y error visible en desarrollo
    
    Co-authored-by: Cursor <cursoragent@cursor.com>

[33mcommit 7cc13b4c5d4d567f2ce0060572a91935bb1ef85f[m
Author: Leandro Insfrán <leandro.insfran@systelec.com>
Date:   Sun Jul 5 01:25:42 2026 -0300

    fix: alta de equipos GNC - transacciones, fechas y series duplicadas
    
    Co-authored-by: Cursor <cursoragent@cursor.com>

[33mcommit 80416ee3c2ac430ce2280db993eb6d1973af876c[m
Author: Leandro Insfrán <leandro.insfran@systelec.com>
Date:   Sun Jul 5 01:13:19 2026 -0300

    fix: validador de update de vehiculos sin exigir clienteId
    
    Co-authored-by: Cursor <cursoragent@cursor.com>

[33mcommit 2b685d20f63eed0d709a9fad3503c22f53c9cd10[m
Author: Leandro Insfrán <leandro.insfran@systelec.com>
Date:   Sun Jul 5 01:05:16 2026 -0300

    fix: BaseRepository.create con Lucid Model.create para alta de clientes
    
    Co-authored-by: Cursor <cursoragent@cursor.com>

[33mcommit a3e486e2115a71015a5fcb89bdbbfe0fd9c5bc64[m
Author: Leandro Insfrán <leandro.insfran@systelec.com>
Date:   Sun Jul 5 00:48:14 2026 -0300

    fix: evitar doble hash de password en seeder y UserService
    
    Co-authored-by: Cursor <cursoragent@cursor.com>

[33mcommit 0dbc7aa7fd0eeaeb4adbb70fb57acc2d795555cc[m
Author: Leandro Insfrán <leandro.insfran@systelec.com>
Date:   Sun Jul 5 00:06:16 2026 -0300

    fix: exports de shared-types compatibles con tsx en Node ESM
    
    Co-authored-by: Cursor <cursoragent@cursor.com>

[33mcommit 97629b2bf276c04c8ceea09d0c0c1663aa89ee8d[m
Author: Leandro Insfrán <leandro.insfran@systelec.com>
Date:   Sun Jul 5 00:00:57 2026 -0300

    fix: registrar eventos de auditoria en start/events.ts para ace CLI
    
    Co-authored-by: Cursor <cursoragent@cursor.com>

[33mcommit 050e218dfa6bbc8d2332c8b0ca7c3df730a301fe[m
Author: Leandro Insfrán <leandro.insfran@systelec.com>
Date:   Sat Jul 4 23:58:36 2026 -0300

    fix: simplificar logger sin pino-pretty para migraciones en Linux
    
    Co-authored-by: Cursor <cursoragent@cursor.com>

[33mcommit 6c35965f0cac155c45c4ef53c03d3aed464d56f8[m
Author: Leandro Insfrán <leandro.insfran@systelec.com>
Date:   Sat Jul 4 23:54:01 2026 -0300

    fix: agregar config logger y app de AdonisJS para migraciones ace
    
    Co-authored-by: Cursor <cursoragent@cursor.com>

[33mcommit 5dd8c5b76237125759bdb32f80fc1f00d5ff0cec[m
Author: Leandro Insfrán <leandro.insfran@systelec.com>
Date:   Sat Jul 4 23:47:30 2026 -0300

    fix: ace.js y configuración Bouncer para migraciones

[33mcommit 472cf67730116ee72b6a491382e2edd516561656[m
Author: Leandro Insfrán <leandro.insfran@systelec.com>
Date:   Sat Jul 4 01:29:47 2026 -0300

    first commit
