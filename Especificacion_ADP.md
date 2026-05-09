# Especificación funcional y técnica de la herramienta Excel CT–VEC–IP para evaluación de cotizaciones

## 1. Propósito del documento

Este documento describe detalladamente el funcionamiento esperado de la herramienta Excel desarrollada para evaluar, priorizar y gestionar oportunidades de cotización en un departamento de ingeniería.

El objetivo de este documento es que un agente de IA o desarrollador, por ejemplo Codex, pueda revisar el archivo Excel existente, identificar inconsistencias, corregir fórmulas, completar elementos faltantes y dejar la herramienta funcionando según el modelo definido.

La herramienta permite responder tres preguntas principales:

1. ¿Qué tan complejo es cotizar este proyecto?
2. ¿Conviene cotizar este proyecto desde una perspectiva de valor esperado?
3. Si existen varias oportunidades, ¿cuál debe cotizarse primero?

Para responder estas preguntas, la herramienta integra cuatro componentes principales:

- CT: Complejidad Técnica.
- VEC: Valor Esperado de Cotizar.
- Tₒ: Tiempo objetivo de cotización.
- IP: Índice de Prioridad.

---

## 2. Flujo general de la herramienta

El flujo lógico esperado es el siguiente:

```text
INPUT_PROYECTO
      ↓
CT_CHECKLIST
      ↓
CT_CALCULO
      ↓
CALCULO
      ↓
REFERENCIAS_CT
      ↓
VEC / Tₒ / IP / Decisión
```

El usuario ingresa datos del proyecto y marca criterios mediante checkboxes. La herramienta calcula automáticamente:

- puntaje por bloque de CT;
- CT continuo;
- CT discreto en escala 1–5;
- Tₒ asociado al CT;
- probabilidad de adjudicación P;
- impacto económico I;
- margen normalizado M;
- factor capacidad F_C;
- VEC;
- IP;
- decisión final: BID, POSTERGAR o NO-BID.

---

## 3. Hojas esperadas en el libro Excel

El libro debe contener, como mínimo, las siguientes hojas:

| Hoja | Propósito |
|---|---|
| `INPUT_PROYECTO` | Captura datos generales, económicos y de capacidad del proyecto. |
| `CT_CHECKLIST` | Checklist de complejidad técnica con checkboxes vinculados a celdas auxiliares. |
| `CT_CALCULO` | Cálculo técnico del CT por bloques, pesos y aportes. |
| `PROBABILIDAD` | Cálculo de la probabilidad de adjudicación P. |
| `PARAMETROS` | Parámetros globales editables: alpha, umbrales, monto máximo histórico, horas disponibles. |
| `REFERENCIAS_CT` | Tabla CT → rango de horas → Tₒ. |
| `CALCULO` | Resultados finales: CT, Tₒ, P, I, M, F_C, VEC, IP y decisión. |
| `INSTRUCCIONES_VBA` | Instrucciones para macros, checkboxes y mantenimiento. |

Si alguna de estas hojas no existe, Codex debe crearla.

---

## 4. Hoja `INPUT_PROYECTO`

### 4.1 Campos esperados

| Celda sugerida | Campo | Tipo | Observación |
|---|---|---|---|
| `B3` | Proyecto | Texto | Nombre del proyecto. |
| `B4` | Cliente | Texto | Nombre o categoría del cliente. |
| `B5` | Monto proyecto (USD) | Número | Debe ingresarse sin separador de miles. Ejemplo: `1800000`, no `1,800,000`. |
| `B6` | Margen objetivo (%) | Número | Ejemplo: `15`. |
| `B7` | Margen esperado (%) | Número o vacío | Si está vacío, debe usarse margen estimado por CT. |
| `B8` | Horas estimadas para cotizar | Número o vacío | Si existe, se usa para calcular F_C. |
| `B9` | Nivel de saturación | Lista desplegable | Baja, Media, Alta, Crítica. Se usa solo si `B8` está vacío. |

### 4.2 Validaciones

La celda `B9` debe tener lista desplegable:

```text
Baja;Media;Alta;Crítica
```

### 4.3 Regla de capacidad

La lógica esperada es:

```text
Si hay horas estimadas para cotizar:
    usar F_C por horas.
Si no hay horas estimadas pero sí hay saturación:
    usar F_C por saturación.
Si no hay horas ni saturación:
    mostrar advertencia: "Falta dato capacidad".
```

---

## 5. Hoja `CT_CHECKLIST`

Esta hoja contiene los criterios del CT. Cada criterio tiene un checkbox de Control de formulario vinculado a una celda auxiliar.

Importante:

- No usar ActiveX.
- Usar checkboxes de Control de formulario.
- No multiplicar directamente celdas VERDADERO/FALSO en fórmulas.
- Las opciones base son exclusivas en los bloques H, B, D, G, E, C y F.
- Las opciones incrementales son acumulativas.
- El bloque A no es exclusivo porque las disciplinas se acumulan.

---

## 6. Mapeo de celdas auxiliares de `CT_CHECKLIST`

El siguiente mapeo se considera estándar. Codex debe verificar si el archivo usa estas celdas. Si el archivo utiliza otras celdas, debe adaptar las fórmulas o normalizar el libro a este mapeo.

### 6.1 Bloque H — Urgencia

| Criterio | Tipo | Celda vinculada | Puntaje |
|---|---|---:|---:|
| Plazo estándar | Base exclusiva | `Z4` | 0 |
| Plazo reducido negociable | Base exclusiva | `Z5` | 10 |
| Plazo reducido no negociable | Base exclusiva | `Z6` | 20 |
| Trabajo en paralelo | Incremental | `Z8` | 10 |
| Horas extra | Incremental | `Z9` | 10 |
| Abandono de otros proyectos | Incremental | `Z10` | 10 |

Máximo del bloque H:

```text
50
```

---

### 6.2 Bloque B — Alcance

| Criterio | Tipo | Celda vinculada | Puntaje |
|---|---|---:|---:|
| Alcance claro | Base exclusiva | `AA4` | 0 |
| Alcance parcialmente definido | Base exclusiva | `AA5` | 10 |
| Alcance pobre / ambiguo | Base exclusiva | `AA6` | 25 |
| Dependiente de decisiones futuras | Incremental | `AA8` | 10 |

Máximo del bloque B:

```text
35
```

---

### 6.3 Bloque D — Categorías de objetos

| Criterio | Tipo | Celda vinculada | Puntaje |
|---|---|---:|---:|
| Pocas categorías de objetos | Base exclusiva | `AB14` | 5 |
| Varias categorías de objetos | Base exclusiva | `AB15` | 10 |
| Muchas categorías de objetos | Base exclusiva | `AB16` | 15 |
| Cantidades dependientes / estimadas | Incremental | `AB18` | 5 |

Máximo del bloque D:

```text
20
```

---

### 6.4 Bloque G — Experiencia / referencias

| Criterio | Tipo | Celda vinculada | Puntaje |
|---|---|---:|---:|
| Referencias claras y recientes | Base exclusiva | `AC14` | 0 |
| Referencias parciales | Base exclusiva | `AC15` | 10 |
| Sin referencias | Base exclusiva | `AC16` | 15 |
| Información dispersa / no organizada | Incremental | `AC18` | 10 |

Máximo del bloque G:

```text
25
```

---

### 6.5 Bloque E — Subcontratos

| Criterio | Tipo | Celda vinculada | Puntaje |
|---|---|---:|---:|
| Sin subcontratos | Base exclusiva | `AD21` | 0 |
| Uno o dos subcontratos | Base exclusiva | `AD22` | 5 |
| Varios subcontratos | Base exclusiva | `AD23` | 10 |
| Múltiples cotizaciones externas | Incremental | `AD25` | 5 |
| Alta volatilidad de precios | Incremental | `AD26` | 10 |

Máximo del bloque E:

```text
25
```

---

### 6.6 Bloque A — Disciplinas

Este bloque no es exclusivo. Las disciplinas se acumulan.

| Disciplina | Tipo | Celda vinculada | Puntaje |
|---|---|---:|---:|
| Electromecánico | Acumulativo | `AE21` | 35 |
| Civil | Acumulativo | `AE22` | 35 |
| Servicios | Acumulativo | `AE23` | 10 |
| Críticos | Acumulativo | `AE24` | 10 |
| BMS | Acumulativo | `AE25` | 10 |

Además, se debe calcular automáticamente interacción entre disciplinas:

| Número de disciplinas activas | Puntaje interacción |
|---:|---:|
| 0 o 1 | 0 |
| 2 | 5 |
| 3 | 10 |
| 4 | 15 |
| 5 | 20 |

Máximo del bloque A:

```text
120
```

No debe existir checkbox manual para “Interacción entre disciplinas”. La interacción se calcula automáticamente.

---

### 6.7 Bloque C — Ingeniería / validación

| Criterio | Tipo | Celda vinculada | Puntaje |
|---|---|---:|---:|
| Sin ingeniería previa / solución estándar | Base exclusiva | `AF29` | 0 |
| Ingeniería básica | Base exclusiva | `AF30` | 10 |
| Ingeniería detallada | Base exclusiva | `AF31` | 15 |
| Diseño ad hoc | Base exclusiva | `AF32` | 25 |
| Validación interna requerida | Incremental | `AF34` | 10 |

Máximo del bloque C:

```text
35
```

La validación interna es incremental, no base exclusiva.

---

### 6.8 Bloque F — Permisos / normativa

| Criterio | Tipo | Celda vinculada | Puntaje |
|---|---|---:|---:|
| Sin permisos | Base exclusiva | `AG29` | 0 |
| Permisos estándar | Base exclusiva | `AG30` | 5 |
| Permisos especiales | Base exclusiva | `AG31` | 10 |
| Normativa compleja / múltiples autoridades | Base exclusiva | `AG32` | 15 |

Máximo del bloque F:

```text
15
```

---

## 7. Hoja `CT_CALCULO`

Esta hoja debe calcular el CT de forma trazable.

### 7.1 Estructura esperada

| Columna | Contenido |
|---|---|
| `A` | Bloque |
| `B` | Score normalizado 0–1 |
| `C` | Peso |
| `D` | Aporte ponderado |

### 7.2 Pesos definitivos del CT

Usar estos pesos definitivos, no versiones alternas:

| Bloque | Peso |
|---|---:|
| H — Urgencia | 25 |
| B — Alcance | 20 |
| D — Categorías | 15 |
| G — Experiencia / referencias | 12 |
| E — Subcontratos | 10 |
| A — Disciplinas | 8 |
| C — Ingeniería / validación | 7 |
| F — Permisos / normativa | 3 |
| Total | 100 |

Los pesos pueden registrarse como 25, 20, 15, etc. Si se registran como 0,25, 0,20, etc., las fórmulas de CT deben ajustarse para que el total final sea consistente. Se recomienda usar escala 0–100 para facilitar lectura.

---

## 8. Fórmulas definitivas para `CT_CALCULO`

Todas las fórmulas están escritas para Excel en español, usando:

- coma decimal;
- punto y coma como separador de argumentos;
- `SI(celda=VERDADERO; valor; 0)`;
- sin multiplicar directamente VERDADERO/FALSO.

### 8.1 Bloque H — Urgencia

En `CT_CALCULO!B2`:

```excel
=(
MAX(
SI(CT_CHECKLIST!Z4=VERDADERO; 0; 0);
SI(CT_CHECKLIST!Z5=VERDADERO; 10; 0);
SI(CT_CHECKLIST!Z6=VERDADERO; 20; 0)
)
+
SI(CT_CHECKLIST!Z8=VERDADERO; 10; 0)
+
SI(CT_CHECKLIST!Z9=VERDADERO; 10; 0)
+
SI(CT_CHECKLIST!Z10=VERDADERO; 10; 0)
)/50
```

---

### 8.2 Bloque B — Alcance

En `CT_CALCULO!B3`:

```excel
=(
MAX(
SI(CT_CHECKLIST!AA4=VERDADERO; 0; 0);
SI(CT_CHECKLIST!AA5=VERDADERO; 10; 0);
SI(CT_CHECKLIST!AA6=VERDADERO; 25; 0)
)
+
SI(CT_CHECKLIST!AA8=VERDADERO; 10; 0)
)/35
```

---

### 8.3 Bloque D — Categorías de objetos

En `CT_CALCULO!B4`:

```excel
=(
MAX(
SI(CT_CHECKLIST!AB14=VERDADERO; 5; 0);
SI(CT_CHECKLIST!AB15=VERDADERO; 10; 0);
SI(CT_CHECKLIST!AB16=VERDADERO; 15; 0)
)
+
SI(CT_CHECKLIST!AB18=VERDADERO; 5; 0)
)/20
```

---

### 8.4 Bloque G — Experiencia / referencias

En `CT_CALCULO!B5`:

```excel
=(
MAX(
SI(CT_CHECKLIST!AC14=VERDADERO; 0; 0);
SI(CT_CHECKLIST!AC15=VERDADERO; 10; 0);
SI(CT_CHECKLIST!AC16=VERDADERO; 15; 0)
)
+
SI(CT_CHECKLIST!AC18=VERDADERO; 10; 0)
)/25
```

---

### 8.5 Bloque E — Subcontratos

En `CT_CALCULO!B6`:

```excel
=(
MAX(
SI(CT_CHECKLIST!AD21=VERDADERO; 0; 0);
SI(CT_CHECKLIST!AD22=VERDADERO; 5; 0);
SI(CT_CHECKLIST!AD23=VERDADERO; 10; 0)
)
+
SI(CT_CHECKLIST!AD25=VERDADERO; 5; 0)
+
SI(CT_CHECKLIST!AD26=VERDADERO; 10; 0)
)/25
```

---

### 8.6 Bloque A — Disciplinas

En `CT_CALCULO!B7`:

```excel
=(
SI(CT_CHECKLIST!AE21=VERDADERO; 35; 0)
+
SI(CT_CHECKLIST!AE22=VERDADERO; 35; 0)
+
SI(CT_CHECKLIST!AE23=VERDADERO; 10; 0)
+
SI(CT_CHECKLIST!AE24=VERDADERO; 10; 0)
+
SI(CT_CHECKLIST!AE25=VERDADERO; 10; 0)
+
SI(CONTAR.SI(CT_CHECKLIST!AE21:AE25; VERDADERO)<=1; 0;
SI(CONTAR.SI(CT_CHECKLIST!AE21:AE25; VERDADERO)=2; 5;
SI(CONTAR.SI(CT_CHECKLIST!AE21:AE25; VERDADERO)=3; 10;
SI(CONTAR.SI(CT_CHECKLIST!AE21:AE25; VERDADERO)=4; 15;
20))))
)/120
```

---

### 8.7 Bloque C — Ingeniería / validación

En `CT_CALCULO!B8`:

```excel
=(
MAX(
SI(CT_CHECKLIST!AF29=VERDADERO; 0; 0);
SI(CT_CHECKLIST!AF30=VERDADERO; 10; 0);
SI(CT_CHECKLIST!AF31=VERDADERO; 15; 0);
SI(CT_CHECKLIST!AF32=VERDADERO; 25; 0)
)
+
SI(CT_CHECKLIST!AF34=VERDADERO; 10; 0)
)/35
```

---

### 8.8 Bloque F — Permisos / normativa

En `CT_CALCULO!B9`:

```excel
=MAX(
SI(CT_CHECKLIST!AG29=VERDADERO; 0; 0);
SI(CT_CHECKLIST!AG30=VERDADERO; 5; 0);
SI(CT_CHECKLIST!AG31=VERDADERO; 10; 0);
SI(CT_CHECKLIST!AG32=VERDADERO; 15; 0)
)/15
```

---

### 8.9 Aporte ponderado por bloque

En `CT_CALCULO!D2`:

```excel
=B2*C2
```

Copiar desde `D2` hasta `D9`.

### 8.10 CT continuo

Si los pesos están como 25, 20, 15, etc., entonces en `CT_CALCULO!D10`:

```excel
=SUMA(D2:D9)
```

Resultado esperado: número entre 0 y 100.

Si los pesos están como 0,25, 0,20, etc., entonces el resultado será entre 0 y 1. Se recomienda la escala 0–100.

### 8.11 CT discreto

Si `CT_CALCULO!D10` está en escala 0–100, usar:

```excel
=SI(CT_CALCULO!D10<20; 1;
SI(CT_CALCULO!D10<40; 2;
SI(CT_CALCULO!D10<60; 3;
SI(CT_CALCULO!D10<80; 4;
5))))
```

Si `CT_CALCULO!D10` está en escala 0–1, usar:

```excel
=SI(CT_CALCULO!D10<0,2; 1;
SI(CT_CALCULO!D10<0,4; 2;
SI(CT_CALCULO!D10<0,6; 3;
SI(CT_CALCULO!D10<0,8; 4;
5))))
```

---

## 9. Hoja `REFERENCIAS_CT`

### 9.1 Estructura esperada

| CT | Horas mín | Horas máx | Tₒ |
|---:|---:|---:|---:|
| 1 | 4 | 8 | 6 |
| 2 | 8 | 16 | 12 |
| 3 | 16 | 32 | 24 |
| 4 | 32 | 64 | 48 |
| 5 | 64 | 120 | 92 |

El Tₒ se calcula como:

```excel
=(B2+C2)/2
```

Para CT = 5:

```text
(64 + 120) / 2 = 92
```

---

## 10. Hoja `PROBABILIDAD`

### 10.1 Entradas esperadas

| Variable | Opciones | Valores |
|---|---|---|
| Relación cliente R | Excelente, Buena, Intermedia, Desconocido, Mala | 1,00; 0,85; 0,65; 0,50; 0,30 |
| Competencia C | Único oferente, Licitación privada, Licitación pública, Estudio de mercado | 1,00; 0,60; 0,35; 0,20 |
| Experiencia interna E | Alta, Media, Baja, Nula | 1,00; 0,75; 0,50; 0,30 |

### 10.2 Fórmula de P

```excel
P = R * C * E
```

En Excel español, si los valores R, C y E están en `E3:E5`:

```excel
=E3*E4*E5
```

Nota: esta multiplicación sí es correcta porque aquí las celdas son numéricas, no VERDADERO/FALSO.

---

## 11. Hoja `PARAMETROS`

### 11.1 Parámetros globales esperados

| Parámetro | Valor inicial recomendado |
|---|---:|
| Alpha / sensibilidad | 1 |
| Umbral BID | 0,20 |
| Umbral POSTERGAR | 0,08 |
| Monto máximo histórico | 2000000 |
| Horas disponibles | 160 |
| Cap máximo de M | 1,30 |

El cap máximo de M es una mejora recomendada. Si no existe, Codex puede agregarlo.

---

## 12. Hoja `CALCULO`

Esta hoja debe mostrar resultados agregados.

### 12.1 Resultados esperados

| Resultado | Fórmula conceptual |
|---|---|
| CT continuo | `CT_CALCULO!D10` |
| CT discreto | Conversión de CT continuo a 1–5 |
| Tₒ | Buscar CT discreto en `REFERENCIAS_CT` |
| P | `PROBABILIDAD!P` |
| I | `Monto proyecto / Monto máximo histórico`, capeado a 1 |
| M | Margen esperado / margen objetivo, o factor por CT si no hay margen esperado |
| F_C | Capacidad por horas o saturación |
| VEC | `P * I * M * F_C` |
| IP | `VEC / Tₒ` |
| Decisión | BID / POSTERGAR / NO-BID |

---

## 13. Fórmulas recomendadas para `CALCULO`

Las celdas exactas pueden variar. Codex debe ubicar las celdas existentes y corregir las fórmulas según corresponda.

### 13.1 CT discreto

Si CT continuo está en `CT_CALCULO!D10` y está en escala 0–100:

```excel
=SI(CT_CALCULO!D10<20; 1;
SI(CT_CALCULO!D10<40; 2;
SI(CT_CALCULO!D10<60; 3;
SI(CT_CALCULO!D10<80; 4;
5))))
```

---

### 13.2 Tₒ

Si CT discreto está en `CALCULO!B6`:

```excel
=BUSCARV(B6; REFERENCIAS_CT!A2:D6; 4; FALSO)
```

---

### 13.3 Probabilidad P

```excel
=PROBABILIDAD!E7
```

Ajustar referencia si P está en otra celda.

---

### 13.4 Impacto económico I

```excel
=MIN(INPUT_PROYECTO!B5/PARAMETROS!B6; 1)
```

`INPUT_PROYECTO!B5` debe ser numérico sin separador de miles.

---

### 13.5 Margen M

La fórmula debe implementar modelo mixto:

```excel
=SI(INPUT_PROYECTO!B7="";
BUSCARV(B6; PARAMETROS!E2:F6; 2; FALSO);
MIN(INPUT_PROYECTO!B7/INPUT_PROYECTO!B6; PARAMETROS!B8)
)
```

Notas:

- `B6` es CT discreto.
- `PARAMETROS!E2:F6` debe contener tabla de factor M por CT.
- `PARAMETROS!B8` puede contener el cap máximo de M, por ejemplo `1,30`.

Si no se implementa cap de M, usar:

```excel
=SI(INPUT_PROYECTO!B7="";
BUSCARV(B6; PARAMETROS!E2:F6; 2; FALSO);
INPUT_PROYECTO!B7/INPUT_PROYECTO!B6
)
```

Tabla recomendada para margen por CT:

| CT | Factor M si no hay margen esperado |
|---:|---:|
| 1 | 1,00 |
| 2 | 0,95 |
| 3 | 0,85 |
| 4 | 0,75 |
| 5 | 0,60 |

---

### 13.6 Factor capacidad F_C

Fórmula recomendada:

```excel
=SI(INPUT_PROYECTO!B8<>"";
EXP(-PARAMETROS!B3*(INPUT_PROYECTO!B8/PARAMETROS!B7));
SI(INPUT_PROYECTO!B9="Baja"; 1;
SI(INPUT_PROYECTO!B9="Media"; 0,75;
SI(INPUT_PROYECTO!B9="Alta"; 0,45;
SI(INPUT_PROYECTO!B9="Crítica"; 0,20;
"Falta dato capacidad")))))
```

Nota: si el resultado puede ser texto por falta de dato, la fórmula del VEC debe protegerse.

---

### 13.7 VEC

Si P, I, M y F_C están en celdas numéricas, usar:

```excel
=P*I*M*F_C
```

Si existen celdas específicas, por ejemplo:

- P en `B3`
- I en `B4`
- M en `B5`
- F_C en `B7`

entonces:

```excel
=SI(ESNUMERO(B7); B3*B4*B5*B7; "")
```

---

### 13.8 Decisión

Si VEC está en `B9`:

```excel
=SI(B9=""; "";
SI(B9>=PARAMETROS!B4; "BID";
SI(B9>=PARAMETROS!B5; "POSTERGAR";
"NO-BID")))
```

---

### 13.9 IP

Si VEC está en `B9` y Tₒ en `B10`:

```excel
=SI(O(B9=""; B10=0); ""; B9/B10)
```

---

## 14. Matriz CT × VEC

La matriz funciona como capa de gobernanza. No sustituye al VEC.

### 14.1 Clasificación de VEC

| VEC | Categoría |
|---|---|
| `< 0,08` | Bajo |
| `0,08 – 0,20` | Medio |
| `>= 0,20` | Alto |

### 14.2 Matriz recomendada

| CT \ VEC | Bajo | Medio | Alto |
|---|---|---|---|
| CT 1–2 | POSTERGAR | BID | BID |
| CT 3 | NO-BID | POSTERGAR | BID |
| CT 4 | NO-BID | NO-BID | POSTERGAR |
| CT 5 | NO-BID | NO-BID | NO-BID / Revisión estratégica |

### 14.3 Regla de coherencia

| Caso | Acción |
|---|---|
| VEC y matriz coinciden | Ejecutar decisión. |
| VEC = BID y matriz = POSTERGAR o NO-BID | Revisión estratégica obligatoria. |
| VEC = NO-BID | Descartar oportunidad. |
| IP alto pero matriz bloquea | Prevalece matriz o revisión estratégica. |

---

## 15. Macros VBA de exclusividad para checkboxes

Los checkboxes de Control de formulario deben tener macros asignadas directamente. No se debe depender de `Worksheet_Change`, porque no es confiable con Form Controls.

### 15.1 Función común

En un módulo estándar:

```vba
Sub Exclusivo(rng As Range, celdaActiva As Range)
    Dim c As Range
    Application.EnableEvents = False

    For Each c In rng
        If c.Address <> celdaActiva.Address Then
            c.Value = False
        End If
    Next c

    Application.EnableEvents = True
End Sub
```

### 15.2 Macros por checkbox base

```vba
Sub H_Z4() : Exclusivo Range("Z4:Z6"), Range("Z4") : End Sub
Sub H_Z5() : Exclusivo Range("Z4:Z6"), Range("Z5") : End Sub
Sub H_Z6() : Exclusivo Range("Z4:Z6"), Range("Z6") : End Sub

Sub B_AA4() : Exclusivo Range("AA4:AA6"), Range("AA4") : End Sub
Sub B_AA5() : Exclusivo Range("AA4:AA6"), Range("AA5") : End Sub
Sub B_AA6() : Exclusivo Range("AA4:AA6"), Range("AA6") : End Sub

Sub D_AB14() : Exclusivo Range("AB14:AB16"), Range("AB14") : End Sub
Sub D_AB15() : Exclusivo Range("AB14:AB16"), Range("AB15") : End Sub
Sub D_AB16() : Exclusivo Range("AB14:AB16"), Range("AB16") : End Sub

Sub G_AC14() : Exclusivo Range("AC14:AC16"), Range("AC14") : End Sub
Sub G_AC15() : Exclusivo Range("AC14:AC16"), Range("AC15") : End Sub
Sub G_AC16() : Exclusivo Range("AC14:AC16"), Range("AC16") : End Sub

Sub E_AD21() : Exclusivo Range("AD21:AD23"), Range("AD21") : End Sub
Sub E_AD22() : Exclusivo Range("AD21:AD23"), Range("AD22") : End Sub
Sub E_AD23() : Exclusivo Range("AD21:AD23"), Range("AD23") : End Sub

Sub C_AF29() : Exclusivo Range("AF29:AF32"), Range("AF29") : End Sub
Sub C_AF30() : Exclusivo Range("AF29:AF32"), Range("AF30") : End Sub
Sub C_AF31() : Exclusivo Range("AF29:AF32"), Range("AF31") : End Sub
Sub C_AF32() : Exclusivo Range("AF29:AF32"), Range("AF32") : End Sub

Sub F_AG29() : Exclusivo Range("AG29:AG32"), Range("AG29") : End Sub
Sub F_AG30() : Exclusivo Range("AG29:AG32"), Range("AG30") : End Sub
Sub F_AG31() : Exclusivo Range("AG29:AG32"), Range("AG31") : End Sub
Sub F_AG32() : Exclusivo Range("AG29:AG32"), Range("AG32") : End Sub
```

### 15.3 Asignación de macros

Cada checkbox base debe tener asignada su macro específica.

Ejemplo:

| Checkbox | Macro |
|---|---|
| Plazo estándar | `H_Z4` |
| Plazo reducido negociable | `H_Z5` |
| Plazo reducido no negociable | `H_Z6` |

Los incrementales no necesitan macro de exclusividad.

El bloque A no necesita macros de exclusividad.

---

## 16. Formato condicional

### 16.1 Decisión final

La celda de decisión debe cambiar color según texto:

| Texto | Color |
|---|---|
| BID | Verde |
| POSTERGAR | Amarillo |
| NO-BID | Rojo |

No usar escala numérica sobre una celda de texto.

### 16.2 Alertas recomendadas

Se recomienda agregar formato condicional para:

| Condición | Alerta |
|---|---|
| Falta dato capacidad | Rojo o naranja |
| CT = 5 | Rojo suave |
| VEC alto pero matriz bloquea | Naranja / “Revisión estratégica” |
| Horas estimadas > 1,3 × Tₒ | “Sobreesfuerzo” |
| Horas estimadas < 0,7 × Tₒ | “Subestimado” |

---

## 17. Caso de prueba para validación

Usar este caso para comprobar funcionamiento.

### 17.1 `INPUT_PROYECTO`

| Campo | Valor |
|---|---|
| Proyecto | Ampliación eléctrica y baja tensión en planta industrial |
| Cliente | Cliente industrial recurrente |
| Monto proyecto | `1100000` |
| Margen objetivo | `15` |
| Margen esperado | `14` |
| Horas estimadas | `30` |
| Saturación | Vacío o cualquier valor, porque debe ignorarse si hay horas |

### 17.2 `PROBABILIDAD`

| Variable | Selección |
|---|---|
| Relación cliente | Buena |
| Competencia | Licitación privada |
| Experiencia interna | Alta |

P esperado:

```text
0,85 × 0,60 × 1,00 = 0,51
```

### 17.3 `CT_CHECKLIST`

Marcar:

| Bloque | Selección |
|---|---|
| H | Plazo reducido negociable + Horas extra |
| B | Alcance parcialmente definido + Dependiente de decisiones futuras |
| D | Varias categorías + Cantidades dependientes / estimadas |
| G | Referencias parciales |
| E | Uno o dos subcontratos + Múltiples cotizaciones externas |
| A | Electromecánico + Civil + Servicios |
| C | Ingeniería básica + Validación interna requerida |
| F | Permisos estándar |

### 17.4 Resultados esperados de CT

| Bloque | Score | Peso | Aporte |
|---|---:|---:|---:|
| H | 0,4000 | 25 | 10,00 |
| B | 0,5714 | 20 | 11,43 |
| D | 0,7500 | 15 | 11,25 |
| G | 0,4000 | 12 | 4,80 |
| E | 0,4000 | 10 | 4,00 |
| A | 0,7500 | 8 | 6,00 |
| C | 0,5714 | 7 | 4,00 |
| F | 0,3333 | 3 | 1,00 |

CT continuo esperado:

```text
52,48
```

CT discreto esperado:

```text
3
```

Tₒ esperado:

```text
24
```

### 17.5 Resultados esperados de VEC

| Factor | Valor esperado |
|---|---:|
| P | 0,51 |
| I | 0,55 |
| M | 0,9333 |
| F_C | 0,8290 |

Cálculos:

```text
I = 1100000 / 2000000 = 0,55
M = 14 / 15 = 0,9333
F_C = EXP(-1*(30/160)) = 0,8290
VEC = 0,51 × 0,55 × 0,9333 × 0,8290 = 0,2170
```

Decisión esperada:

```text
BID
```

IP esperado:

```text
0,2170 / 24 = 0,0090
```

Matriz CT × VEC esperada:

```text
CT = 3, VEC alto => BID
```

No debe haber conflicto entre VEC y matriz.

---

## 18. Lista de verificación para Codex

Codex debe revisar y corregir lo siguiente:

### 18.1 Estructura

- [ ] Existe hoja `CT_CALCULO`.
- [ ] Existe hoja `REFERENCIAS_CT`.
- [ ] Existe hoja `CALCULO`.
- [ ] Existe hoja `PARAMETROS`.
- [ ] Existe hoja `PROBABILIDAD`.
- [ ] Existe hoja `CT_CHECKLIST`.

### 18.2 CT

- [ ] Pesos CT definitivos: 25, 20, 15, 12, 10, 8, 7, 3.
- [ ] Bloque H incluye incrementales Z8:Z10.
- [ ] Bloque B incluye incremental AA8.
- [ ] Bloque D incluye incremental AB18.
- [ ] Bloque G incluye incremental AC18.
- [ ] Bloque E incluye incrementales AD25:AD26.
- [ ] Bloque A suma disciplinas + interacción.
- [ ] Bloque C trata AF34 como incremental.
- [ ] Bloque F no tiene incrementales.
- [ ] No se multiplican directamente celdas VERDADERO/FALSO.

### 18.3 VEC

- [ ] P = R × C × E.
- [ ] I = MIN(monto / monto máximo; 1).
- [ ] M usa margen esperado si existe.
- [ ] Si no hay margen esperado, M usa factor por CT.
- [ ] F_C usa horas si existen.
- [ ] Si no hay horas, F_C usa saturación.
- [ ] Si faltan horas y saturación, se muestra alerta.
- [ ] VEC = P × I × M × F_C.
- [ ] Decisión usa umbrales 0,20 y 0,08.

### 18.4 Tₒ e IP

- [ ] Tₒ se busca desde `REFERENCIAS_CT`.
- [ ] CT 5 tiene Tₒ = 92, no 64 ni 96.
- [ ] IP = VEC / Tₒ.
- [ ] IP no decide BID/NO-BID, solo prioriza proyectos elegibles.

### 18.5 VBA

- [ ] Macros están en módulo estándar.
- [ ] No depender de `Worksheet_Change`.
- [ ] Cada checkbox base tiene macro asignada.
- [ ] Incrementales no tienen macros de exclusividad.
- [ ] Bloque A no tiene macros de exclusividad.

### 18.6 Visualización

- [ ] Decisión final tiene formato condicional por texto.
- [ ] Existe alerta visual para conflictos VEC vs matriz.
- [ ] Celdas auxiliares pueden ocultarse, pero no deben eliminarse.

---

## 19. Recomendaciones de implementación para Codex

1. Trabajar sobre una copia del archivo original.
2. Si el archivo es `.xlsm`, preservar macros usando una herramienta compatible.
3. Si se usa `openpyxl`, cargar con `keep_vba=True` para no destruir el proyecto VBA.
4. Validar fórmulas con el caso de prueba incluido.
5. No cambiar la lógica del modelo sin documentarlo.
6. No reemplazar fórmulas españolas por fórmulas en inglés si el archivo será usado en Excel con configuración regional española.
7. No insertar separadores de miles en montos.
8. Mantener coma decimal y punto y coma en fórmulas visibles para el usuario.
9. Documentar cualquier cambio estructural en una hoja `CHANGELOG` o `NOTAS_MODELO`.

---

## 20. Resultado esperado final de la herramienta

Al finalizar la corrección, la herramienta debe permitir lo siguiente:

1. El usuario llena `INPUT_PROYECTO`.
2. El usuario marca criterios en `CT_CHECKLIST`.
3. Los checkboxes base exclusivos funcionan correctamente.
4. `CT_CALCULO` calcula scores, pesos y CT continuo.
5. `CALCULO` muestra CT discreto.
6. `REFERENCIAS_CT` devuelve Tₒ automáticamente.
7. `PROBABILIDAD` calcula P.
8. `CALCULO` calcula I, M, F_C, VEC e IP.
9. La decisión final muestra BID / POSTERGAR / NO-BID.
10. El semáforo visual cambia correctamente.
11. La matriz CT × VEC alerta conflictos.
12. El caso de prueba arroja aproximadamente:

```text
CT continuo = 52,48
CT discreto = 3
Tₒ = 24
P = 0,51
I = 0,55
M = 0,9333
F_C = 0,8290
VEC = 0,2170
IP = 0,0090
Decisión = BID
Matriz = BID
Conflicto = No
```

---

## 21. Cierre

Este documento define la versión funcional esperada del modelo Excel CT–VEC–IP. Cualquier corrección o mejora realizada por Codex debe mantener la coherencia con esta especificación. El objetivo no es rediseñar el modelo, sino corregir y consolidar la implementación para que refleje fielmente la lógica metodológica definida para el TFG.
