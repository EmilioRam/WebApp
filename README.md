# WebApp

WebApp monol�tica (backend+frontend)

backend:
- conexi�n con Azure IoT Hub para recepci�n de mensajes de los dispositivos medidores
- reenv�o de mensajes a todos los clientes conectados mediante WebSockets
- Almacenamiento de registros de mediciones en MongoDB Atlas
- Servicio API REST para consulta de BD

frontend:
- p�gina de visualizaci�n de medidas en tiempo real, con gr�fica de �ltimas medidas
- p�gina de consulta y descarga de hist�ricos por dispositivo y fechas, con representaci�n gr�fica de la consulta y descarga en formato .csv