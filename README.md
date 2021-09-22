# WebApp

WebApp monolítica (backend+frontend)

backend:
- conexión con Azure IoT Hub para recepción de mensajes de los dispositivos medidores
- reenvío de mensajes a todos los clientes conectados mediante WebSockets
- Almacenamiento de registros de mediciones en MongoDB Atlas
- Servicio API REST para consulta de BD

frontend:
- página de visualización de medidas en tiempo real, con gráfica de últimas medidas
- página de consulta y descarga de históricos por dispositivo y fechas, con representación gráfica de la consulta y descarga en formato .csv