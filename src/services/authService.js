/**
 * Servicio para manejar la comunicación con el backend desde el Website independiente.
 */
const API_URL = '/api'; 

export const submitApplication = async (applicantData) => {
  try {
    const response = await fetch(`${API_URL}/applicants`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(applicantData)
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