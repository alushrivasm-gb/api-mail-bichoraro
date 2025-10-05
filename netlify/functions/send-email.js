const nodemailer = require('nodemailer');

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://bichoraro.pe",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json"
};

exports.handler = async (event, context) => {
  // CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: "ok"
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Método no permitido" })
    };
  }

  try {
    const { email, page, section } = JSON.parse(event.body);

    // 🔧 CORRECCIÓN: createTransport (sin 'er')
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const subject = "Nuevo contacto desde la web";
    const body = `Se completó el formulario desde ${page}` + 
                 (section ? ` sección ${section}` : "") + 
                 `, persona de contacto ${email}.\n\nFecha: ${new Date().toLocaleString("es-PE", {
                   timeZone: "America/Lima"
                 })}`;

    await transporter.sendMail({
      from: "oye@bichoraro.pe",
      to: "oye@bichoraro.pe",
      subject: subject,
      text: body
    });

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        message: "Email enviado correctamente"
      })
    };

  } catch (error) {
    console.error('Error sending email:', error);
    
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        success: false,
        error: error.message || "Error interno del servidor"
      })
    };
  }
};