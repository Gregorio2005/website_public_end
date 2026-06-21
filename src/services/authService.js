/**
 * Servicio para manejar la comunicación con el backend desde el Website independiente.
 */
//const API_URL = '/api'; // <--- USAR PARA DESARROLLO LOCAL
const API_URL = 'https://backend-sealing-products.onrender.com/api'; // <--- USAR PARA PRODUCCIÓN (Render)

/**
 * Envía una postulación con datos + CV (archivo PDF).
 * Usa FormData en lugar de JSON para poder adjuntar el archivo.
 */
export const submitApplication = async (formData) => {
  try {
    const response = await fetch(`${API_URL}/applicants`, {
      method: 'POST',
      body: formData // FormData ya incluye Content-Type multipart/form-data automáticamente
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al enviar la postulación');
    }

    return await response.json();
  } catch (error) {
    console.error("Error en submitApplication:", error);
    throw error;
  }
};

/**
 * Obtiene el aviso activo para el sitio web.
 */
export const getWebsiteNotice = async () => {
  try {
    const response = await fetch(`${API_URL}/website-notice`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    
    const latestNotice = Array.isArray(data.data) && data.data.length > 0 ? data.data[0] : null;
    
    return { 
      enabled: !!latestNotice, 
      note: latestNotice?.note || 'Actualmente no contamos con vacantes disponibles.', 
      name: latestNotice?.name || 'none',
      id: latestNotice?.id || null
    };
  } catch (error) {
    return { enabled: false, note: "No disponible", name: 'none' };
  }
};
