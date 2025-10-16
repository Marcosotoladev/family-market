import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Genera las listas de categorías para el prompt
 */
function generarCategoriasParaPrompt() {
  // Productos - formato real de tu DB
  const categoriasProductos = [
    'alimentos_bebidas',
    'panaderia_reposteria', 
    'ropa_indumentaria',
    'accesorios_complementos',
    'hogar_decoracion',
    'electronica_tecnologia',
    'libros_revistas',
    'juguetes_juegos',
    'deportes_fitness',
    'salud_bienestar',
    'belleza_cosmetica',
    'mascotas',
    'jardin_exterior',
    'herramientas',
    'vehiculos_accesorios',
    'arte_manualidades',
    'otros'
  ].join(', ');
  
  // Servicios - formato real de tu DB
  const categoriasServicios = [
    'belleza_y_bienestar',
    'salud_y_medicina',
    'educacion_y_capacitacion',
    'tecnologia_e_informatica',
    'hogar_y_mantenimiento',
    'automotriz',
    'eventos_y_celebraciones',
    'deportes_y_fitness',
    'mascotas',
    'consultoria_y_negocios',
    'marketing_y_publicidad',
    'diseño_y_creatividad',
    'fotografia_y_video',
    'musica_y_entretenimiento',
    'gastronomia',
    'jardineria_y_paisajismo',
    'limpieza',
    'transporte_y_logistica',
    'servicios_legales',
    'servicios_financieros',
    'otros'
  ].join(', ');
  
  // Empleos - formato real de tu DB
  const categoriasEmpleos = [
    'administracion',
    'tecnologia',
    'salud',
    'belleza',
    'educacion',
    'gastronomia',
    'construccion',
    'hogar',
    'transporte',
    'ventas',
    'marketing',
    'eventos',
    'automotriz',
    'legal',
    'seguridad',
    'mascotas',
    'otro'
  ].join(', ');
  
  return {
    productos: categoriasProductos,
    servicios: categoriasServicios,
    empleos: categoriasEmpleos
  };
}

/**
 * Analiza la búsqueda del usuario y extrae intención, categorías y palabras clave
 */
export async function analyzeSearchIntent(searchQuery) {
  try {
    const categorias = generarCategoriasParaPrompt();
    
    const prompt = `
Eres un asistente que ayuda a entender qué busca un usuario en un marketplace local argentino.

El usuario buscó: "${searchQuery}"

Analiza la búsqueda y responde SOLO con un JSON (sin markdown, sin explicaciones) con esta estructura:
{
  "intencion": "descripción breve de qué busca",
  "tipo_busqueda": ["productos", "servicios", "empleos"],
  "categorias_productos": ["categoría1", "categoría2"],
  "categorias_servicios": ["categoría1", "categoría2"],
  "categorias_empleos": ["categoría1", "categoría2"],
  "palabras_clave": ["palabra1", "palabra2", "palabra3"],
  "es_para_regalar": true/false,
  "genero_objetivo": "masculino/femenino/neutro/cualquiera"
}

CATEGORÍAS DISPONIBLES (usar EXACTAMENTE estos IDs):

**PRODUCTOS:**
${categorias.productos}

**SERVICIOS:**
${categorias.servicios}

**EMPLEOS:**
${categorias.empleos}

INSTRUCCIONES IMPORTANTES:
- Usa los IDs exactos de las categorías listadas arriba
- Si el usuario busca "vino", "cerveza", "whisky" → productos: ["alimentos_bebidas"]
- Si busca "regalos para mamá" → productos: ["belleza_cosmetica", "accesorios_complementos"] y servicios: ["belleza_y_bienestar"]
- Si busca "plomero" → servicios: ["hogar_y_mantenimiento"] y empleos: ["construccion"]
- Si busca "trabajo de programador" → empleos: ["tecnologia"]
- Si busca "transporte", "chofer", "taxi" → servicios: ["transporte_y_logistica"] y empleos: ["transporte"]
- Siempre incluye palabras clave relevantes del texto original
- Sé flexible: "comida" puede ser productos (alimentos_bebidas) o servicios (gastronomia)

Ejemplos:

Usuario: "vino tinto"
Respuesta: {"intencion":"buscar vino","tipo_busqueda":["productos"],"categorias_productos":["alimentos_bebidas"],"categorias_servicios":[],"categorias_empleos":[],"palabras_clave":["vino","tinto","bebida","alcohol","rutini","malbec"],"es_para_regalar":false,"genero_objetivo":"cualquiera"}

Usuario: "que puedo regalar a mi mama"
Respuesta: {"intencion":"buscar regalo para madre","tipo_busqueda":["productos","servicios"],"categorias_productos":["belleza_cosmetica","accesorios_complementos","ropa_indumentaria"],"categorias_servicios":["belleza_y_bienestar"],"categorias_empleos":[],"palabras_clave":["regalo","mama","mujer","madre","belleza"],"es_para_regalar":true,"genero_objetivo":"femenino"}

Usuario: "necesito un plomero"
Respuesta: {"intencion":"buscar servicios de plomeria","tipo_busqueda":["servicios","empleos"],"categorias_productos":[],"categorias_servicios":["hogar_y_mantenimiento"],"categorias_empleos":["construccion","hogar"],"palabras_clave":["plomero","plomeria","reparacion","agua","cañeria","arreglo"],"es_para_regalar":false,"genero_objetivo":"cualquiera"}

Usuario: "busco trabajo de diseñador web"
Respuesta: {"intencion":"buscar empleo en diseño web","tipo_busqueda":["empleos"],"categorias_productos":[],"categorias_servicios":[],"categorias_empleos":["tecnologia","marketing"],"palabras_clave":["trabajo","empleo","diseñador","diseño","web","desarrollador","programador"],"es_para_regalar":false,"genero_objetivo":"cualquiera"}

Usuario: "servicio de belleza"
Respuesta: {"intencion":"buscar servicios de belleza","tipo_busqueda":["servicios"],"categorias_productos":[],"categorias_servicios":["belleza_y_bienestar"],"categorias_empleos":[],"palabras_clave":["belleza","estetica","peluqueria","masajes","tratamiento"],"es_para_regalar":false,"genero_objetivo":"cualquiera"}
`;

    console.log('🤖 Llamando a OpenAI...');
    
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Eres un asistente experto en analizar búsquedas de usuarios en un marketplace argentino. Siempre respondes con JSON válido sin formato markdown.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    const content = response.choices[0].message.content.trim();
    console.log('📨 Respuesta de OpenAI:', content);
    
    // Limpiar posible markdown
    const jsonString = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const analysis = JSON.parse(jsonString);
    
    console.log('✅ Análisis parseado correctamente');
    
    return {
      success: true,
      data: analysis
    };

  } catch (error) {
    console.error('❌ Error analyzing search intent:', error);
    return {
      success: false,
      error: error.message,
      // Fallback básico
      data: {
        intencion: searchQuery,
        tipo_busqueda: ['productos', 'servicios', 'empleos'],
        categorias_productos: [],
        categorias_servicios: [],
        categorias_empleos: [],
        palabras_clave: searchQuery.toLowerCase().split(' ').filter(w => w.length > 2),
        es_para_regalar: false,
        genero_objetivo: 'cualquiera'
      }
    };
  }
}