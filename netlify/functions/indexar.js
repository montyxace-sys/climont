const { google } = require('googleapis');

exports.handler = async (event, context) => {
  // Solo aceptamos peticiones POST (las que enviará Supabase)
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Método no permitido' };
  }

  try {
    // Parseamos la información enviada por el Webhook de Supabase
    const body = JSON.parse(event.body);
    
    // Suponiendo que tu tabla de Supabase envía la nueva URL en el campo 'url'
    const urlAIndexar = body.record.url; 

    if (!urlAIndexar) {
      return { statusCode: 400, body: 'Falta la URL en los datos enviados' };
    }

    if (!process.env.GOOGLE_PRIVATE_KEY || !process.env.GOOGLE_CLIENT_EMAIL) {
      return { statusCode: 500, body: 'Faltan credenciales de Google (GOOGLE_PRIVATE_KEY/GOOGLE_CLIENT_EMAIL)' };
    }

    // Cargamos las credenciales desde las variables de entorno seguras de Netlify
    const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;

    const jwtClient = new google.auth.JWT(
      clientEmail,
      null,
      privateKey,
      ['https://www.googleapis.com/auth/indexing'],
      null
    );

    // Autenticamos con Google
    await jwtClient.authorize();

    // Enviamos la petición de indexación inmediata
    const response = await google.indexing('v3').urlNotifications.publish({
      auth: jwtClient,
      requestBody: {
        url: urlAIndexar,
        type: 'URL_UPDATED' // Fuerza a Google a rastrear/actualizar la URL
      }
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Aviso enviado a Google con éxito', data: response.data })
    };

  } catch (error) {
    console.error('Error al indexar:', error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
PY
