# Implementación de Clúster Web con Balanceo de Carga

## Información del Proyecto

**Institución:** Universidad Autónoma de Occidente  
**Programa:** Ingeniería Informática  
**Curso:** Servicios Telemáticos

**Autores:**
- Juan Sebastian Ballesteros Sierra (2200405)
- Juan Esteban Salazar Toro (2221681)
- Jean Paul Ordoñez Ibarguen (2221275)
## Descripción

Este proyecto implementa un clúster web con balanceo de carga utilizando Apache mod_proxy_balancer en un entorno virtualizado. La infraestructura consta de tres máquinas virtuales Ubuntu Server 20.04 LTS orquestadas con Vagrant y VirtualBox, diseñadas para demostrar los principios de alta disponibilidad y distribución de carga en sistemas distribuidos.

## Arquitectura del Sistema

La solución implementada se compone de tres nodos virtualizados interconectados mediante una red privada:

| Máquina Virtual | Hostname | Dirección IP | Función |
|-----------------|----------|--------------|---------|
| VM1 | vm1-api | 192.168.50.10 | Servidor backend 1 - Apache HTTP Server |
| VM2 | vm2-db | 192.168.50.20 | Servidor backend 2 - Apache HTTP Server |
| VM3 | loadbalancer | 192.168.50.30 | Balanceador de carga - Apache mod_proxy_balancer |

## Requisitos Previos

### Software Necesario

- VirtualBox 6.1 o superior
- Vagrant 2.2 o superior
- Node.js 14+ y npm (para Artillery y scripts de análisis)
- Artillery (para pruebas de carga)
- Conexión a internet para descarga de boxes

### Recursos de Hardware Recomendados

- Procesador con soporte de virtualización (Intel VT-x o AMD-V)
- 4 GB RAM mínimo (8 GB recomendado)
- 10 GB de espacio en disco disponible

## Instalación y Configuración

### 1. Clonar el Repositorio
```bash
git clone https://github.com/usuario/ProyectoFinall_ServiciosTelematicos.git
cd ProyectoFinall_ServiciosTelematicos
```

### 2. Verificar Configuración de Vagrant

Asegúrese de que el archivo `Vagrantfile` esté presente en el directorio raíz del proyecto. Este archivo define la configuración de las tres máquinas virtuales.

### 3. Levantar la Infraestructura
```bash
vagrant up
```

Este comando realizará automáticamente:
- Descarga de las boxes personalizadas desde Vagrant Cloud
- Creación de las tres máquinas virtuales
- Configuración de red privada
- Aprovisionamiento de servicios Apache

### 4. Verificar Estado de las Máquinas
```bash
vagrant status
```

Debe mostrar las tres máquinas en estado "running".

### 5. Verificar Conectividad

Desde la máquina host, acceda al balanceador de carga:
```bash
curl http://192.168.50.30
```

Ejecute el comando varias veces para observar la alternancia entre respuestas de VM1 y VM2.

## Acceso a las Máquinas Virtuales

### Conexión SSH

Para conectarse a cualquier máquina virtual:
```bash
# Servidor backend 1
vagrant ssh vm1

# Servidor backend 2
vagrant ssh vm2

# Balanceador de carga
vagrant ssh vm3
```

### Verificación de Servicios Apache

Una vez conectado a cualquier VM:
```bash
sudo systemctl status apache2
sudo systemctl is-enabled apache2
```

## Configuración del Balanceador de Carga

El balanceador (VM3) está configurado con el método de balanceo `byrequests`, que distribuye equitativamente las peticiones entre los backends.

### Panel de Monitoreo

Acceda al panel de administración del balanceador:
```
http://192.168.50.30/balancer-manager
```

Este panel permite visualizar en tiempo real:
- Número de peticiones por backend
- Estado de cada servidor miembro
- Distribución porcentual de carga
- Métricas de tráfico HTTP

## Pruebas de Carga con Artillery

El repositorio incluye seis escenarios de prueba predefinidos:

| Archivo | Descripción |
|---------|-------------|
| `heavy-api.yml` | Carga pesada sobre endpoints API REST |
| `heavy-db.yml` | Simulación de operaciones intensivas de base de datos |
| `heavy-medio.yml` | Carga media balanceada para operación normal |
| `heavy.json` | Configuración base de carga pesada genérica |
| `soak-test.yml` | Prueba de resistencia prolongada (15 minutos) |
| `surge-test.yml` | Simulación de picos abruptos de tráfico |

### Instalación de Artillery
```bash
npm install -g artillery
```

### Ejecución de Pruebas
```bash
# Prueba de carga media
artillery run --output report-heavy-medio.json heavy-medio.yml

# Prueba de resistencia
artillery run --output report-soak-test.json soak-test.yml

# Prueba de picos de tráfico
artillery run --output report-surge-test.json surge-test.yml
```

### Generación de Reportes
```bash
# Generar reporte HTML visual
artillery report report-heavy-medio.json
```

Este comando genera un reporte HTML detallado con gráficas de rendimiento.

### Análisis de Resultados con Script Personalizado

El proyecto incluye un script Node.js que procesa automáticamente los archivos JSON de Artillery y extrae las métricas más relevantes:
```bash
# Analizar resultados de una prueba específica
node resumen-artillery.js report-heavy-medio.json

# Analizar múltiples pruebas
node resumen-artillery.js report-soak-test.json
node resumen-artillery.js report-surge-test.json
```

#### Salida del Script

El script `resumen-artillery.js` genera dos tipos de salida:

**1. Formato Legible en Consola:**
```
📊 Resumen de la prueba: report-heavy-medio.json
====================================
Total de Requests       : 1500
Respuestas 200 OK       : 1500
Errores totales         : 0
% de error              : 0.00%
Tipo(s) de error        : Ninguno
RPS promedio            : 25.0 req/s

⏱️ Latencias (ms – http.response_time)
  min   : 45
  p50   : 180
  p95   : 320
  max   : 450
  media : 180.0
```

**2. Formato CSV para Análisis:**
```csv
file,requests,ok,errors,errors_pct,error_types,rps_mean,lat_min,lat_p50,lat_p95,lat_max
report-heavy-medio.json,1500,1500,0,0.00,"Ninguno",25,45,180,320,450
```

#### Métricas Analizadas

El script extrae y calcula:
- **Total de Requests**: Número total de peticiones HTTP realizadas
- **Respuestas 200 OK**: Peticiones exitosas
- **Errores totales**: Número de peticiones fallidas
- **Porcentaje de error**: Tasa de error calculada
- **Tipos de error**: Clasificación de errores encontrados
- **RPS promedio**: Peticiones por segundo promedio
- **Latencias**: Estadísticas de tiempo de respuesta (min, p50, p95, max, media)

#### Consolidación de Resultados

Para comparar múltiples pruebas, puede redirigir la salida CSV a un archivo:
```bash
# Crear archivo CSV consolidado
echo "file,requests,ok,errors,errors_pct,error_types,rps_mean,lat_min,lat_p50,lat_p95,lat_max" > resultados-consolidados.csv

# Agregar resultados de cada prueba
node resumen-artillery.js report-heavy-medio.json | tail -1 >> resultados-consolidados.csv
node resumen-artillery.js report-heavy-api.json | tail -1 >> resultados-consolidados.csv
node resumen-artillery.js report-heavy-db.json | tail -1 >> resultados-consolidados.csv
node resumen-artillery.js report-soak-test.json | tail -1 >> resultados-consolidados.csv
node resumen-artillery.js report-surge-test.json | tail -1 >> resultados-consolidados.csv
```

## Resultados de Pruebas

Los resultados consolidados de las pruebas de carga demuestran:

| Escenario | Usuarios Concurrentes | Latencia Promedio | Tasa de Éxito |
|-----------|----------------------|-------------------|---------------|
| heavy-medio.yml | 25 | 180 ms | 100.0% |
| heavy-api.yml | 50 | 240 ms | 98.2% |
| heavy-db.yml | 50 | 265 ms | 97.5% |
| soak-test.yml | 20 | 320 ms | 95.8% |
| surge-test.yml | 5-150 | 410 ms | 91.3% |
| heavy.json | 75 | 355 ms | 93.7% |

El sistema mantiene estabilidad operativa hasta aproximadamente 100 usuarios concurrentes, con degradación gradual pero controlada en niveles superiores.

## Gestión del Entorno

### Detener las Máquinas Virtuales
```bash
# Suspender todas las VMs
vagrant suspend

# Detener todas las VMs
vagrant halt

# Detener una VM específica
vagrant halt vm1
```

### Reiniciar el Entorno
```bash
# Reiniciar todas las VMs
vagrant reload

# Reiniciar con reprovisionamiento
vagrant reload --provision
```

### Eliminar el Entorno
```bash
# Destruir todas las VMs
vagrant destroy

# Destruir sin confirmación
vagrant destroy -f
```

## Estructura del Repositorio
```
ProyectoFinall_ServiciosTelematicos/
├── Vagrantfile
├── README.md
├── heavy-api.yml
├── heavy-db.yml
├── heavy-medio.yml
├── heavy.json
├── soak-test.yml
├── surge-test.yml
└── resumen-artillery.js
```

## Solución de Problemas

### Error: Box no encontrada

Si las boxes personalizadas no están disponibles públicamente, contacte a los autores del proyecto para obtener acceso.

### Error de red privada

Verifique que el rango de red 192.168.50.0/24 no esté en uso por otras interfaces de red en su sistema.

### Apache no responde

Conéctese a la VM afectada y verifique:
```bash
vagrant ssh vmX
sudo systemctl restart apache2
sudo tail -f /var/log/apache2/error.log
```

### Problemas de rendimiento

Aumente los recursos asignados a las VMs editando el `Vagrantfile`:
```ruby
vb.memory = 2048
vb.cpus   = 2
```

### Error al ejecutar resumen-artillery.js

Si el script no se ejecuta correctamente:
```bash
# Verificar que Node.js esté instalado
node --version

# Verificar que el archivo JSON existe
ls -l report-*.json

# Verificar permisos del script
chmod +x resumen-artillery.js
```

## Tecnologías Utilizadas

- Ubuntu Server 20.04 LTS
- Apache HTTP Server 2.4
- Apache mod_proxy_balancer
- Vagrant 2.2+
- VirtualBox 6.1+
- Artillery (Node.js)
- Node.js 14+ (para scripts de análisis)

## Referencias

1. The Apache Software Foundation, "mod_proxy_balancer module documentation", 2025
2. Artillery.io, "Artillery Load Testing Toolkit Official Documentation", 2025
3. HashiCorp, "Vagrant Documentation and User Guides", 2025
4. Oracle Corporation, "VirtualBox User Manual and Technical Documentation", 2024

## Licencia

Este proyecto fue desarrollado con fines académicos para el curso de Servicios Telemáticos de la Universidad Autónoma de Occidente.

## Contacto

Para consultas o reporte de problemas relacionados con este proyecto, contacte a los autores a través del repositorio de GitHub.
