"""
Datos semilla para los requisitos de la norma ISO 9001:2015 (Capítulos 4-10).
Cada capítulo tiene entre 3-5 preguntas representativas del diagnóstico de madurez.
"""

NOMBRES_CAPITULOS = {
    4: "Contexto de la Organización",
    5: "Liderazgo",
    6: "Planificación",
    7: "Apoyo",
    8: "Operación",
    9: "Evaluación del Desempeño",
    10: "Mejora",
}

REQUISITOS_SEMILLA = [
    # ── Capítulo 4: Contexto de la Organización ──────────────────────────────
    {
        "capitulo": 4, "numeral": "4.1",
        "pregunta_texto": "¿La organización ha determinado los factores externos e internos (FODA/PESTEL) que son pertinentes para su propósito estratégico?",
        "descripcion_ayuda": "Incluye factores políticos, económicos, sociales, tecnológicos, legales y medioambientales."
    },
    {
        "capitulo": 4, "numeral": "4.2",
        "pregunta_texto": "¿Se han identificado las partes interesadas pertinentes (clientes, proveedores, reguladores) y sus requisitos han sido documentados?",
        "descripcion_ayuda": "Partes interesadas = cualquier persona/entidad que pueda afectar o ser afectada por el SGC."
    },
    {
        "capitulo": 4, "numeral": "4.3",
        "pregunta_texto": "¿El alcance del Sistema de Gestión de Calidad (SGC) está definido, documentado y es coherente con el contexto organizacional?",
        "descripcion_ayuda": "El alcance debe incluir los productos/servicios cubiertos y las exclusiones justificadas."
    },
    {
        "capitulo": 4, "numeral": "4.4",
        "pregunta_texto": "¿Los procesos del SGC están identificados, con sus entradas, salidas, responsables y criterios de desempeño definidos?",
        "descripcion_ayuda": "Mapa de procesos o caracterizaciones de proceso son evidencia válida."
    },

    # ── Capítulo 5: Liderazgo ────────────────────────────────────────────────
    {
        "capitulo": 5, "numeral": "5.1",
        "pregunta_texto": "¿La alta dirección demuestra liderazgo y compromiso activo con el SGC (participación en revisiones, asignación de recursos)?",
        "descripcion_ayuda": "Evidencias: actas de revisión, comunicaciones formales, decisiones de inversión en calidad."
    },
    {
        "capitulo": 5, "numeral": "5.2",
        "pregunta_texto": "¿La organización tiene una Política de Calidad documentada, comunicada a todo el personal y alineada con la dirección estratégica?",
        "descripcion_ayuda": "La política debe incluir el compromiso de mejora continua y satisfacción de requisitos."
    },
    {
        "capitulo": 5, "numeral": "5.3",
        "pregunta_texto": "¿Se han asignado formalmente las responsabilidades y autoridades para los roles pertinentes al SGC?",
        "descripcion_ayuda": "Puede evidenciarse mediante organigrama, fichas de cargo o matriz RACI."
    },

    # ── Capítulo 6: Planificación ────────────────────────────────────────────
    {
        "capitulo": 6, "numeral": "6.1",
        "pregunta_texto": "¿La organización ha realizado una evaluación formal de riesgos y oportunidades del SGC y ha planificado acciones para abordarlos?",
        "descripcion_ayuda": "Herramientas: AMEF, matriz de riesgos, ISO 31000. Debe incluir criterios de aceptación."
    },
    {
        "capitulo": 6, "numeral": "6.2",
        "pregunta_texto": "¿Se han establecido Objetivos de Calidad medibles, coherentes con la política, comunicados y con planes de seguimiento definidos?",
        "descripcion_ayuda": "Objetivos deben ser SMART: Específicos, Medibles, Alcanzables, Relevantes, con Tiempo definido."
    },
    {
        "capitulo": 6, "numeral": "6.3",
        "pregunta_texto": "¿Existe un proceso formal para planificar y gestionar los cambios al SGC de manera controlada?",
        "descripcion_ayuda": "Incluye análisis de impacto, aprobaciones y comunicación de cambios."
    },

    # ── Capítulo 7: Apoyo ────────────────────────────────────────────────────
    {
        "capitulo": 7, "numeral": "7.1",
        "pregunta_texto": "¿La organización ha determinado y proporcionado los recursos necesarios (humanos, infraestructura, ambiente) para el SGC?",
        "descripcion_ayuda": "Incluye presupuesto asignado, equipos calibrados, software y espacios de trabajo."
    },
    {
        "capitulo": 7, "numeral": "7.2",
        "pregunta_texto": "¿Las competencias requeridas para los roles que afectan al SGC están definidas y se verifica el nivel de competencia real del personal?",
        "descripcion_ayuda": "Matriz de competencias, evaluaciones de desempeño, registros de formación."
    },
    {
        "capitulo": 7, "numeral": "7.4",
        "pregunta_texto": "¿Existe un proceso de comunicación interna y externa que define qué, cuándo, a quién y cómo se comunica la información del SGC?",
        "descripcion_ayuda": "Plan de comunicaciones, reuniones periódicas, tableros de indicadores."
    },
    {
        "capitulo": 7, "numeral": "7.5",
        "pregunta_texto": "¿La información documentada del SGC se controla mediante un proceso que incluye creación, actualización, distribución y retención?",
        "descripcion_ayuda": "Procedimiento de control de documentos y registros con versionado."
    },

    # ── Capítulo 8: Operación ────────────────────────────────────────────────
    {
        "capitulo": 8, "numeral": "8.1",
        "pregunta_texto": "¿Los procesos operacionales se planifican, implementan y controlan mediante criterios documentados para asegurar la conformidad del producto/servicio?",
        "descripcion_ayuda": "Instrucciones de trabajo, flujogramas de proceso, fichas técnicas."
    },
    {
        "capitulo": 8, "numeral": "8.2",
        "pregunta_texto": "¿Existe un proceso para determinar, revisar y comunicar los requisitos del cliente, incluyendo los legales y reglamentarios aplicables?",
        "descripcion_ayuda": "Contratos, especificaciones técnicas, revisión de oferta/pedido."
    },
    {
        "capitulo": 8, "numeral": "8.4",
        "pregunta_texto": "¿Se controlan los procesos, productos y servicios suministrados externamente mediante criterios de evaluación y seguimiento a proveedores?",
        "descripcion_ayuda": "Lista de proveedores aprobados, evaluación periódica, especificaciones de compra."
    },
    {
        "capitulo": 8, "numeral": "8.7",
        "pregunta_texto": "¿Existe un proceso para identificar, controlar y tratar las salidas no conformes (producto/servicio que no cumple requisitos)?",
        "descripcion_ayuda": "Registros de no conformidades, cuarentena de producto, disposición documentada."
    },

    # ── Capítulo 9: Evaluación del Desempeño ────────────────────────────────
    {
        "capitulo": 9, "numeral": "9.1",
        "pregunta_texto": "¿La organización realiza seguimiento y medición sistemáticos del desempeño del SGC mediante indicadores de proceso y producto?",
        "descripcion_ayuda": "Tablero de indicadores KPI, frecuencia de medición y responsables definidos."
    },
    {
        "capitulo": 9, "numeral": "9.1.2",
        "pregunta_texto": "¿Se mide la percepción del cliente sobre el grado en que se cumplen sus necesidades y expectativas (satisfacción del cliente)?",
        "descripcion_ayuda": "Encuestas, NPS, análisis de quejas, reuniones de retroalimentación."
    },
    {
        "capitulo": 9, "numeral": "9.2",
        "pregunta_texto": "¿Se llevan a cabo auditorías internas planificadas para evaluar la conformidad e implementación efectiva del SGC?",
        "descripcion_ayuda": "Programa anual de auditorías, auditores competentes, informes de auditoría."
    },
    {
        "capitulo": 9, "numeral": "9.3",
        "pregunta_texto": "¿La alta dirección realiza revisiones periódicas del SGC considerando desempeño de procesos, resultados de auditorías y oportunidades de mejora?",
        "descripcion_ayuda": "Actas de revisión por la dirección con entradas y salidas documentadas."
    },

    # ── Capítulo 10: Mejora ──────────────────────────────────────────────────
    {
        "capitulo": 10, "numeral": "10.1",
        "pregunta_texto": "¿La organización determina y selecciona oportunidades de mejora e implementa acciones necesarias para cumplir los requisitos del cliente?",
        "descripcion_ayuda": "Proyectos de mejora, resultados de análisis de datos, benchmarking."
    },
    {
        "capitulo": 10, "numeral": "10.2",
        "pregunta_texto": "¿Existe un proceso formal para gestionar las no conformidades: reacción, análisis de causa raíz, acciones correctivas y verificación de eficacia?",
        "descripcion_ayuda": "Registro de no conformidades y acciones correctivas (RNAC), ciclo PHVA aplicado."
    },
    {
        "capitulo": 10, "numeral": "10.3",
        "pregunta_texto": "¿La organización mejora continuamente la conveniencia, adecuación y eficacia del SGC mediante el análisis de los resultados del sistema?",
        "descripcion_ayuda": "Tendencias de indicadores, lecciones aprendidas, innovación en procesos."
    },
]
