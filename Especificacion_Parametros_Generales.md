# Especificación para Codex: parámetros generales del modelo CT–VEC–IP

## 1. Objetivo

Este documento explica cuáles son los **parámetros generales** de la herramienta Excel CT–VEC–IP y cómo deben diferenciarse de los datos propios de cada proyecto.

La herramienta evalúa oportunidades de cotización mediante:

```text
CT  = Complejidad Técnica
Tₒ  = Tiempo objetivo de cotización
VEC = Valor Esperado de Cotizar
IP  = Índice de Prioridad
```

Codex debe revisar que los parámetros generales estén centralizados, sean consistentes y no se mezclen con entradas específicas de cada proyecto.

---

## 2. Separación obligatoria

### 2.1 Datos propios de cada proyecto

Cambian en cada oportunidad evaluada. Deben ubicarse principalmente en:

```text
INPUT_PROYECTO
CT_CHECKLIST
PROBABILIDAD
```

Incluyen:

- Nombre del proyecto.
- Cliente.
- Monto del proyecto.
- Margen esperado.
- Horas estimadas para cotizar.
- Nivel de saturación.
- Selecciones del checklist CT.
- Relación con cliente.
- Competencia.
- Experiencia interna.

### 2.2 Parámetros generales del modelo

No cambian por proyecto. Deben ubicarse principalmente en:

```text
PARAMETROS
REFERENCIAS_CT
CT_CALCULO
Tablas auxiliares del modelo
```

Solo deben modificarse por:

- decisión gerencial;
- comité experto;
- calibración histórica;
- revisión metodológica formal.

---

## 3. Regla para Codex

Codex debe mantener esta lógica:

```text
El usuario operativo ingresa datos del proyecto.
El modelo usa parámetros generales ya definidos.
Los parámetros generales solo se modifican por validación experta o calibración.
```

No mover parámetros generales a zonas de entrada libre del usuario.

---

# 4. Parámetros generales de CT

El CT mide la complejidad de preparar una cotización.

Fórmula conceptual:

```text
Score_bloque = Puntaje bruto del bloque / Puntaje máximo del bloque
CT_continuo = SUMA(Score_bloque × Peso_bloque)
```

Se recomienda que `CT_continuo` esté en escala 0–100.

---

## 4.1 Pesos definitivos de bloques CT

| Bloque | Descripción | Peso |
|---|---|---:|
| H | Urgencia | 25 |
| B | Alcance | 20 |
| D | Categorías de objetos | 15 |
| G | Experiencia / referencias | 12 |
| E | Subcontratos | 10 |
| A | Disciplinas | 8 |
| C | Ingeniería / validación | 7 |
| F | Permisos / normativa | 3 |
| **Total** |  | **100** |

Reglas:

- Los pesos deben sumar 100.
- No usar versiones alternas de pesos.
- La prioridad definida es: `H > B > D > G > E > A > C > F`.

---

## 4.2 Puntajes máximos por bloque

| Bloque | Máximo |
|---|---:|
| H — Urgencia | 50 |
| B — Alcance | 35 |
| D — Categorías de objetos | 20 |
| G — Experiencia / referencias | 25 |
| E — Subcontratos | 25 |
| A — Disciplinas | 120 |
| C — Ingeniería / validación | 35 |
| F — Permisos / normativa | 15 |

Regla:

```text
Score_bloque = (base exclusiva + incrementales acumulativos) / máximo del bloque
```

No usar una simplificación 0; 0,5; 1 si el bloque tiene incrementales.

---

## 4.3 Puntajes internos por bloque

### Bloque H — Urgencia

| Criterio | Tipo | Puntaje |
|---|---|---:|
| Plazo estándar | Base exclusiva | 0 |
| Plazo reducido negociable | Base exclusiva | 10 |
| Plazo reducido no negociable | Base exclusiva | 20 |
| Trabajo en paralelo | Incremental | 10 |
| Horas extra | Incremental | 10 |
| Abandono de otros proyectos | Incremental | 10 |

Máximo: `50`

### Bloque B — Alcance

| Criterio | Tipo | Puntaje |
|---|---|---:|
| Alcance claro | Base exclusiva | 0 |
| Alcance parcialmente definido | Base exclusiva | 10 |
| Alcance pobre / ambiguo | Base exclusiva | 25 |
| Dependiente de decisiones futuras | Incremental | 10 |

Máximo: `35`

### Bloque D — Categorías de objetos

| Criterio | Tipo | Puntaje |
|---|---|---:|
| Pocas categorías de objetos | Base exclusiva | 5 |
| Varias categorías de objetos | Base exclusiva | 10 |
| Muchas categorías de objetos | Base exclusiva | 15 |
| Cantidades dependientes / estimadas | Incremental | 5 |

Máximo: `20`

### Bloque G — Experiencia / referencias

| Criterio | Tipo | Puntaje |
|---|---|---:|
| Referencias claras y recientes | Base exclusiva | 0 |
| Referencias parciales | Base exclusiva | 10 |
| Sin referencias | Base exclusiva | 15 |
| Información dispersa / no organizada | Incremental | 10 |

Máximo: `25`

### Bloque E — Subcontratos

| Criterio | Tipo | Puntaje |
|---|---|---:|
| Sin subcontratos | Base exclusiva | 0 |
| Uno o dos subcontratos | Base exclusiva | 5 |
| Varios subcontratos | Base exclusiva | 10 |
| Múltiples cotizaciones externas | Incremental | 5 |
| Alta volatilidad de precios | Incremental | 10 |

Máximo: `25`

### Bloque A — Disciplinas

Este bloque no es exclusivo. Las disciplinas se acumulan.

| Disciplina | Puntaje |
|---|---:|
| Electromecánico | 35 |
| Civil | 35 |
| Servicios | 10 |
| Críticos | 10 |
| BMS | 10 |

Interacción automática:

| Disciplinas activas | Puntaje interacción |
|---:|---:|
| 0 o 1 | 0 |
| 2 | 5 |
| 3 | 10 |
| 4 | 15 |
| 5 | 20 |

Máximo: `120`

Regla: no debe existir entrada manual para interacción entre disciplinas.

### Bloque C — Ingeniería / validación

| Criterio | Tipo | Puntaje |
|---|---|---:|
| Sin ingeniería previa / solución estándar | Base exclusiva | 0 |
| Ingeniería básica | Base exclusiva | 10 |
| Ingeniería detallada | Base exclusiva | 15 |
| Diseño ad hoc | Base exclusiva | 25 |
| Validación interna requerida | Incremental | 10 |

Máximo: `35`

Regla: `Validación interna requerida` es incremental, no base exclusiva.

### Bloque F — Permisos / normativa

| Criterio | Tipo | Puntaje |
|---|---|---:|
| Sin permisos | Base exclusiva | 0 |
| Permisos estándar | Base exclusiva | 5 |
| Permisos especiales | Base exclusiva | 10 |
| Normativa compleja / múltiples autoridades | Base exclusiva | 15 |

Máximo: `15`

---

# 5. Conversión de CT continuo a CT discreto

Si `CT_continuo` está en escala 0–100:

| CT continuo | CT discreto |
|---|---:|
| `< 20` | 1 |
| `>= 20` y `< 40` | 2 |
| `>= 40` y `< 60` | 3 |
| `>= 60` y `< 80` | 4 |
| `>= 80` | 5 |

Fórmula Excel español:

```excel
=SI(CT_CALCULO!D10<20;1;
SI(CT_CALCULO!D10<40;2;
SI(CT_CALCULO!D10<60;3;
SI(CT_CALCULO!D10<80;4;
5))))
```

---

# 6. Tabla CT → Tₒ

Debe estar en `REFERENCIAS_CT`.

| CT | Horas mín | Horas máx | Tₒ |
|---:|---:|---:|---:|
| 1 | 4 | 8 | 6 |
| 2 | 8 | 16 | 12 |
| 3 | 16 | 32 | 24 |
| 4 | 32 | 64 | 48 |
| 5 | 64 | 120 | 92 |

Fórmula de Tₒ:

```excel
=(B2+C2)/2
```

Regla clave: para CT 5, Tₒ = 92.

---

# 7. Parámetros generales de probabilidad P

La selección se realiza por proyecto, pero los valores numéricos son parámetros generales.

```text
P = R × C × E
```

## 7.1 Relación con cliente R

| Opción | Valor |
|---|---:|
| Excelente | 1,00 |
| Buena | 0,85 |
| Intermedia | 0,65 |
| Desconocido | 0,50 |
| Mala | 0,30 |

## 7.2 Competencia C

| Opción | Valor |
|---|---:|
| Único oferente | 1,00 |
| Licitación privada | 0,60 |
| Licitación pública | 0,35 |
| Estudio de mercado | 0,20 |

## 7.3 Experiencia interna E

| Opción | Valor |
|---|---:|
| Alta | 1,00 |
| Media | 0,75 |
| Baja | 0,50 |
| Nula | 0,30 |

Reglas:

- Preferiblemente ubicar estas tablas en `PARAMETROS`.
- Las listas de `PROBABILIDAD` deben buscar los valores desde esas tablas.
- No hardcodear valores si se puede evitar.

---

# 8. Parámetros generales del impacto económico I

El impacto económico mide tamaño relativo del proyecto.

```text
I = MIN(Monto proyecto / Monto máximo histórico o estratégico; 1)
```

Excel español:

```excel
=MIN(INPUT_PROYECTO!B5/PARAMETROS!B6;1)
```

Parámetros:

| Parámetro | Valor inicial recomendado |
|---|---:|
| Monto máximo histórico / estratégico | 2000000 |
| Límite superior de I | 1,00 |

Reglas:

- El monto máximo histórico es general.
- El monto del proyecto es dato de proyecto.
- Si el monto supera la referencia, I debe capearse en 1.
- No confundir I con utilidad o margen.

---

# 9. Parámetros generales del margen M

El margen mide rentabilidad relativa frente al margen objetivo.

```text
M = Margen esperado / Margen objetivo
```

Parámetros:

| Parámetro | Valor inicial recomendado |
|---|---:|
| Margen objetivo | 15 |
| Cap máximo de M | 1,30 |

## 9.1 Margen estimado por CT

Si el usuario no ingresa margen esperado, usar factor por CT:

| CT | Factor M |
|---:|---:|
| 1 | 1,00 |
| 2 | 0,95 |
| 3 | 0,85 |
| 4 | 0,75 |
| 5 | 0,60 |

Fórmula recomendada:

```excel
=SI(INPUT_PROYECTO!B7="";
BUSCARV(B6;PARAMETROS!E2:F6;2;FALSO);
MIN(INPUT_PROYECTO!B7/INPUT_PROYECTO!B6;PARAMETROS!B8))
```

Reglas:

- Si hay margen esperado, usarlo.
- Si no hay margen esperado, usar factor M por CT.
- No asumir M = 1 cuando falta margen esperado.
- Aplicar cap máximo si está implementado.

---

# 10. Parámetros generales de capacidad F_C

El factor capacidad puede calcularse por horas o saturación.

Jerarquía:

```text
Horas estimadas > Saturación > Falta dato
```

## 10.1 Capacidad por horas

| Parámetro | Valor inicial recomendado |
|---|---:|
| Alpha `α` | 1 |
| Horas disponibles | 160 |

Fórmula:

```excel
=EXP(-PARAMETROS!B3*(INPUT_PROYECTO!B8/PARAMETROS!B7))
```

## 10.2 Capacidad por saturación

| Saturación | F_C |
|---|---:|
| Baja | 1,00 |
| Media | 0,75 |
| Alta | 0,45 |
| Crítica | 0,20 |

## 10.3 Fórmula robusta recomendada

```excel
=SI(PARAMETROS!B7<=0;"Revisar horas disponibles";
SI(ESNUMERO(INPUT_PROYECTO!B8);
EXP(-PARAMETROS!B3*(INPUT_PROYECTO!B8/PARAMETROS!B7));
SI(INPUT_PROYECTO!B9<>"";
BUSCARV(INPUT_PROYECTO!B9;PARAMETROS!H2:I5;2;FALSO);
"Falta dato capacidad")))
```

Reglas:

- Si hay horas, usar horas e ignorar saturación.
- Si no hay horas, usar saturación.
- Si no hay horas ni saturación, mostrar falta de dato.
- Saturación solo afecta `F_C`.
- Saturación no modifica CT, Tₒ, P, I ni M.
- Si `F_C` devuelve texto, VEC no debe calcular.

---

# 11. Parámetros generales del VEC

```text
VEC = P × I × M × F_C
```

## 11.1 Umbrales

| Rango VEC | Decisión |
|---|---|
| `VEC >= 0,20` | BID |
| `0,08 <= VEC < 0,20` | POSTERGAR |
| `VEC < 0,08` | NO-BID |

Parámetros:

| Parámetro | Valor inicial |
|---|---:|
| Umbral BID | 0,20 |
| Umbral POSTERGAR | 0,08 |

Fórmula recomendada:

```excel
=SI(B9="";"Falta dato";
SI(B9>=PARAMETROS!B4;"BID";
SI(B9>=PARAMETROS!B5;"POSTERGAR";
"NO-BID")))
```

Reglas:

- No devolver `NO-BID` por falta de datos.
- Si VEC no puede calcularse, mostrar `Falta dato`.
- Umbrales son generales, no por proyecto.

---

# 12. Parámetro general del IP

```text
IP = VEC / Tₒ
```

Reglas:

- IP no decide BID / NO-BID.
- IP solo prioriza oportunidades elegibles.
- IP no tiene umbral fijo por ahora.
- Si VEC o Tₒ no son numéricos, IP debe quedar vacío.

---

# 13. Matriz CT × VEC

La matriz es una capa de gobernanza. No reemplaza al VEC.

## 13.1 Categorías VEC

| Categoría | Rango |
|---|---|
| Bajo | `< 0,08` |
| Medio | `0,08 – 0,20` |
| Alto | `>= 0,20` |

## 13.2 Matriz recomendada

| CT \ VEC | Bajo | Medio | Alto |
|---|---|---|---|
| CT 1–2 | POSTERGAR | BID | BID |
| CT 3 | NO-BID | POSTERGAR | BID |
| CT 4 | NO-BID | NO-BID | POSTERGAR |
| CT 5 | NO-BID | NO-BID | NO-BID / Revisión estratégica |

## 13.3 Regla de coherencia

| Caso | Acción |
|---|---|
| VEC y matriz coinciden | Ejecutar decisión |
| VEC = BID y matriz = POSTERGAR o NO-BID | Revisión estratégica |
| VEC = NO-BID | Descartar |
| IP alto pero matriz bloquea | Revisión estratégica o prevalece matriz |

Reglas:

- La matriz debe estar en tabla auxiliar o `PARAMETROS`.
- Debe devolver una decisión de gobernanza.
- Debe alertar si no coincide con la decisión VEC.
- No debe alterar CT, VEC ni IP.

---

# 14. Parámetros operativos del archivo Excel

| Parámetro | Configuración |
|---|---|
| Separador decimal | Coma `,` |
| Separador de argumentos | Punto y coma `;` |
| Tipo de checkbox | Control de formulario |
| Macros | Habilitadas |
| Formato final | `.xlsm` |
| Montos | Sin separador de miles |
| Fórmulas | Español |
| Celdas auxiliares | Pueden ocultarse, no eliminarse |

Reglas:

- No convertir fórmulas al formato inglés.
- No usar punto decimal en fórmulas visibles para usuario.
- No eliminar macros.
- Si se usa `openpyxl`, abrir con `keep_vba=True`.
- Trabajar siempre sobre una copia.

---

# 15. Resumen: parámetros propios vs generales

## 15.1 Parámetros propios de cada proyecto

| Parámetro | Hoja sugerida | Frecuencia |
|---|---|---|
| Nombre del proyecto | `INPUT_PROYECTO` | Cada proyecto |
| Cliente | `INPUT_PROYECTO` | Cada proyecto |
| Monto proyecto | `INPUT_PROYECTO` | Cada proyecto |
| Margen esperado | `INPUT_PROYECTO` | Cada proyecto |
| Horas estimadas | `INPUT_PROYECTO` | Cada proyecto |
| Saturación | `INPUT_PROYECTO` | Cada proyecto si no hay horas |
| Checklist CT | `CT_CHECKLIST` | Cada proyecto |
| Relación cliente | `PROBABILIDAD` | Cada proyecto |
| Competencia | `PROBABILIDAD` | Cada proyecto |
| Experiencia interna | `PROBABILIDAD` | Cada proyecto |

## 15.2 Parámetros generales

| Parámetro | Hoja sugerida | Frecuencia |
|---|---|---|
| Pesos CT | `CT_CALCULO` / `PARAMETROS` | Baja |
| Puntajes CT | `PARAMETROS` / documentación | Baja |
| Máximos CT | `CT_CALCULO` / `PARAMETROS` | Baja |
| Rangos CT 1–5 | `PARAMETROS` | Baja |
| Tabla CT → Tₒ | `REFERENCIAS_CT` | Baja |
| Valores R, C, E | `PARAMETROS` | Baja |
| Monto máximo histórico | `PARAMETROS` | Baja |
| Margen objetivo | `PARAMETROS` | Baja |
| Cap máximo de M | `PARAMETROS` | Baja |
| Margen por CT | `PARAMETROS` | Baja |
| Alpha | `PARAMETROS` | Baja o por periodo |
| Horas disponibles | `PARAMETROS` | Por periodo |
| Factores de saturación | `PARAMETROS` | Baja |
| Umbral BID | `PARAMETROS` | Baja |
| Umbral POSTERGAR | `PARAMETROS` | Baja |
| Matriz CT × VEC | `PARAMETROS` | Baja |
| Regla de coherencia | `PARAMETROS` / documentación | Baja |

---

# 16. Responsables sugeridos

| Tipo de dato | Responsable sugerido |
|---|---|
| Datos del proyecto | Usuario evaluador |
| Checklist CT | Usuario evaluador / equipo técnico |
| Probabilidad | Comercial / técnico responsable |
| Pesos CT | Comité técnico / gerencia |
| Puntajes CT | Comité técnico / gerencia |
| Umbrales VEC | Gerencia / dirección comercial |
| Alpha | Jefatura de departamento |
| Horas disponibles | Jefatura de departamento |
| Monto máximo histórico | Gerencia / finanzas |
| Margen objetivo | Gerencia / finanzas / comercial |
| Matriz CT × VEC | Gerencia / comité técnico |

---

# 17. Checklist para Codex

Codex debe verificar:

- [ ] Los parámetros generales están separados de datos de proyecto.
- [ ] Los pesos CT son 25, 20, 15, 12, 10, 8, 7, 3.
- [ ] Los máximos CT son 50, 35, 20, 25, 25, 120, 35, 15.
- [ ] El CT discreto se calcula con rangos correctos.
- [ ] CT 5 devuelve Tₒ = 92.
- [ ] Valores R, C y E coinciden con esta especificación.
- [ ] I usa monto máximo histórico y se capea en 1.
- [ ] M usa margen esperado o factor por CT.
- [ ] M tiene cap máximo si se implementa.
- [ ] F_C respeta horas > saturación > falta dato.
- [ ] Saturación solo afecta F_C.
- [ ] VEC no calcula si algún factor no es numérico.
- [ ] Decisión no devuelve NO-BID por falta de datos.
- [ ] IP = VEC / Tₒ.
- [ ] Matriz CT × VEC genera alerta de conflicto.
- [ ] Fórmulas están en español, con coma decimal y punto y coma.
- [ ] Macros no se eliminan.
- [ ] Parámetros críticos no quedan dispersos sin documentación.

---

# 18. Resultado esperado de estructura

```text
Datos propios del proyecto:
    INPUT_PROYECTO
    CT_CHECKLIST
    PROBABILIDAD

Parámetros generales:
    PARAMETROS
    REFERENCIAS_CT
    Tablas auxiliares

Cálculos:
    CT_CALCULO
    CALCULO

Resultado:
    CT
    Tₒ
    P
    I
    M
    F_C
    VEC
    IP
    Decisión
    Matriz / Alerta de coherencia
```

---

# 19. Nota final para Codex

No rediseñar el modelo sin autorización.

La lógica oficial es:

```text
CT mide complejidad.
Tₒ deriva del CT.
VEC mide conveniencia.
La matriz valida gobernanza.
IP prioriza oportunidades elegibles.
```

Los parámetros generales son parte de la configuración del modelo y deben protegerse contra cambios accidentales.
