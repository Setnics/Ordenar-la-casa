# Especificación para Codex: funcionamiento del factor **Saturación** en la herramienta Excel CT–VEC–IP

## 1. Propósito de este documento

Este documento explica cómo debe funcionar el campo **Nivel de saturación** dentro de la herramienta Excel utilizada para evaluar oportunidades de cotización.

El objetivo es que Codex pueda revisar, corregir o implementar correctamente la lógica de saturación sin alterar el resto del modelo.

La saturación forma parte del cálculo del **Factor Capacidad** `F_C`, el cual alimenta el **Valor Esperado de Cotizar (VEC)**.

La ecuación general del VEC es:

```text
VEC = P × I × M × F_C
```

Donde:

- `P` = probabilidad estimada de adjudicación.
- `I` = impacto económico.
- `M` = margen esperado normalizado.
- `F_C` = factor capacidad.

La **saturación** solo afecta al modelo a través de `F_C`.

---

## 2. Definición conceptual de saturación

La saturación representa una estimación cualitativa del nivel de carga del departamento de cotizaciones cuando no se dispone de una estimación cuantitativa de horas.

Responde a la pregunta:

```text
¿Qué tan disponible está el departamento para absorber una nueva cotización?
```

No mide:

- complejidad técnica;
- urgencia del cliente;
- rentabilidad;
- probabilidad de adjudicación;
- tiempo objetivo `Tₒ`.

Solo mide disponibilidad operativa aproximada.

---

## 3. Regla principal de uso

La herramienta debe aplicar esta jerarquía:

```text
Si existe "Horas estimadas para cotizar":
    calcular F_C con fórmula exponencial por horas.
Si NO existe "Horas estimadas para cotizar" y sí existe "Nivel de saturación":
    calcular F_C con tabla de saturación.
Si NO existen horas ni saturación:
    mostrar alerta: "Falta dato capacidad".
```

Por tanto:

- Las horas estimadas tienen prioridad sobre la saturación.
- Si hay horas, la saturación debe ignorarse.
- La saturación es un respaldo cualitativo, no un factor adicional acumulable.

---

## 4. Ubicación esperada en el Excel

### 4.1 Hoja `INPUT_PROYECTO`

Campos relevantes:

| Celda sugerida | Campo | Tipo |
|---|---|---|
| `B8` | Horas estimadas para cotizar | Número o vacío |
| `B9` | Nivel de saturación | Lista desplegable |

### 4.2 Hoja `PARAMETROS`

Parámetros requeridos:

| Celda sugerida | Campo | Valor inicial recomendado |
|---|---|---:|
| `B3` | Alpha / sensibilidad | `1` |
| `B7` | Horas disponibles | `160` |

Tabla recomendada para saturación:

| Celda | Saturación | Factor |
|---|---|---:|
| `H2:I2` | Baja | `1,00` |
| `H3:I3` | Media | `0,75` |
| `H4:I4` | Alta | `0,45` |
| `H5:I5` | Crítica | `0,20` |

Se recomienda implementar esta tabla en `PARAMETROS!H2:I5`.

---

## 5. Opciones válidas de saturación

La celda `INPUT_PROYECTO!B9` debe tener una lista desplegable con estas opciones exactas:

```text
Baja
Media
Alta
Crítica
```

Importante:

- Usar exactamente `Crítica` con tilde si la tabla de búsqueda también la usa con tilde.
- Evitar variantes como `Critica`, `critica`, `Alta ` con espacios, etc.
- Si se desea mayor robustez, se puede usar una tabla de validación y no texto escrito manualmente.

---

## 6. Interpretación de los niveles de saturación

| Nivel | Factor `F_C` | Interpretación |
|---|---:|---|
| Baja | `1,00` | El departamento tiene capacidad disponible. No se penaliza la oportunidad. |
| Media | `0,75` | Existe carga moderada, pero aún se puede absorber la cotización. |
| Alta | `0,45` | El departamento está cargado. Cotizar implica presión operativa importante. |
| Crítica | `0,20` | El departamento está al límite. Cotizar debería evitarse salvo decisión estratégica. |

Estos valores son iniciales y calibrables.

---

## 7. Cálculo de `F_C` por horas

Si `INPUT_PROYECTO!B8` contiene un número, el modelo debe usar:

```text
F_C = EXP(-alpha × (horas_estimadas / horas_disponibles))
```

En Excel español:

```excel
=EXP(-PARAMETROS!B3*(INPUT_PROYECTO!B8/PARAMETROS!B7))
```

Ejemplo:

| Parámetro | Valor |
|---|---:|
| Horas estimadas | `30` |
| Horas disponibles | `160` |
| Alpha | `1` |

Cálculo:

```text
F_C = EXP(-1 × (30 / 160))
F_C = EXP(-0,1875)
F_C ≈ 0,8290
```

---

## 8. Cálculo de `F_C` por saturación

Si `INPUT_PROYECTO!B8` está vacío y `INPUT_PROYECTO!B9` contiene un nivel válido, entonces `F_C` debe obtenerse desde la tabla de saturación.

Ejemplo con `BUSCARV`:

```excel
=BUSCARV(INPUT_PROYECTO!B9;PARAMETROS!H2:I5;2;FALSO)
```

Resultados esperados:

| Saturación | `F_C` esperado |
|---|---:|
| Baja | `1,00` |
| Media | `0,75` |
| Alta | `0,45` |
| Crítica | `0,20` |

---

## 9. Fórmula recomendada completa para `F_C`

En la hoja `CALCULO`, la celda donde se calcule `F_C` debe usar una fórmula robusta.

Supongamos:

- `INPUT_PROYECTO!B8` = horas estimadas.
- `INPUT_PROYECTO!B9` = saturación.
- `PARAMETROS!B3` = alpha.
- `PARAMETROS!B7` = horas disponibles.
- `PARAMETROS!H2:I5` = tabla de saturación.

Fórmula recomendada:

```excel
=SI(PARAMETROS!B7<=0;"Revisar horas disponibles";
SI(ESNUMERO(INPUT_PROYECTO!B8);
EXP(-PARAMETROS!B3*(INPUT_PROYECTO!B8/PARAMETROS!B7));
SI(INPUT_PROYECTO!B9<>"";
BUSCARV(INPUT_PROYECTO!B9;PARAMETROS!H2:I5;2;FALSO);
"Falta dato capacidad")))
```

### Notas importantes

1. Si `B8` contiene un número, se usa el cálculo por horas.
2. Si `B8` está vacío y `B9` tiene saturación, se usa la tabla.
3. Si faltan ambos datos, se muestra `"Falta dato capacidad"`.
4. Si `PARAMETROS!B7` es menor o igual a cero, se muestra `"Revisar horas disponibles"`.

---

## 10. Fórmula para identificar el modo de capacidad usado

Se recomienda agregar una celda auxiliar visible o de diagnóstico llamada `Modo capacidad`.

Fórmula:

```excel
=SI(PARAMETROS!B7<=0;"Error en horas disponibles";
SI(ESNUMERO(INPUT_PROYECTO!B8);
"Capacidad por horas";
SI(INPUT_PROYECTO!B9<>"";
"Capacidad por saturación";
"Falta dato capacidad")))
```

Esto ayuda al usuario a entender si el modelo está usando horas o saturación.

---

## 11. Cómo debe interactuar saturación con el VEC

La saturación no entra directamente al VEC. Entra únicamente mediante `F_C`.

Flujo correcto:

```text
Nivel de saturación → F_C → VEC
```

No debe existir:

```text
Nivel de saturación → CT
Nivel de saturación → Tₒ
Nivel de saturación → P
Nivel de saturación → I
Nivel de saturación → M
```

La saturación solo afecta capacidad.

---

## 12. Protección de la fórmula del VEC

Si `F_C` devuelve texto, como `"Falta dato capacidad"`, la fórmula del VEC no debe romperse.

Ejemplo de fórmula segura:

```excel
=SI(Y(ESNUMERO(B3);ESNUMERO(B4);ESNUMERO(B5);ESNUMERO(B7));
B3*B4*B5*B7;
"")
```

Donde, por ejemplo:

| Celda | Factor |
|---|---|
| `B3` | `P` |
| `B4` | `I` |
| `B5` | `M` |
| `B7` | `F_C` |

Ajustar referencias según el archivo real.

---

## 13. Protección de la decisión final

Si el VEC está vacío porque falta capacidad, la decisión no debe mostrar `NO-BID` por defecto.

Fórmula recomendada:

```excel
=SI(B9="";"Falta dato";
SI(B9>=PARAMETROS!B4;"BID";
SI(B9>=PARAMETROS!B5;"POSTERGAR";
"NO-BID")))
```

Donde `B9` es la celda del VEC.

---

## 14. Casos de prueba obligatorios

Codex debe validar estos casos.

### Caso 1: Horas presentes, saturación ignorada

| Campo | Valor |
|---|---|
| Horas estimadas | `30` |
| Saturación | `Crítica` |
| Alpha | `1` |
| Horas disponibles | `160` |

Resultado esperado:

```text
F_C ≈ 0,8290
Modo capacidad = Capacidad por horas
```

Aunque la saturación sea `Crítica`, debe ignorarse porque existen horas.

---

### Caso 2: Sin horas, saturación baja

| Campo | Valor |
|---|---|
| Horas estimadas | vacío |
| Saturación | `Baja` |

Resultado esperado:

```text
F_C = 1,00
Modo capacidad = Capacidad por saturación
```

---

### Caso 3: Sin horas, saturación media

| Campo | Valor |
|---|---|
| Horas estimadas | vacío |
| Saturación | `Media` |

Resultado esperado:

```text
F_C = 0,75
Modo capacidad = Capacidad por saturación
```

---

### Caso 4: Sin horas, saturación alta

| Campo | Valor |
|---|---|
| Horas estimadas | vacío |
| Saturación | `Alta` |

Resultado esperado:

```text
F_C = 0,45
Modo capacidad = Capacidad por saturación
```

---

### Caso 5: Sin horas, saturación crítica

| Campo | Valor |
|---|---|
| Horas estimadas | vacío |
| Saturación | `Crítica` |

Resultado esperado:

```text
F_C = 0,20
Modo capacidad = Capacidad por saturación
```

---

### Caso 6: Sin horas y sin saturación

| Campo | Valor |
|---|---|
| Horas estimadas | vacío |
| Saturación | vacío |

Resultado esperado:

```text
F_C = Falta dato capacidad
Modo capacidad = Falta dato capacidad
VEC = vacío
Decisión = Falta dato
```

---

### Caso 7: Horas iguales a capacidad disponible

| Campo | Valor |
|---|---|
| Horas estimadas | `160` |
| Horas disponibles | `160` |
| Alpha | `1` |

Resultado esperado:

```text
F_C = EXP(-1) ≈ 0,3679
Modo capacidad = Capacidad por horas
```

---

### Caso 8: Horas igual a cero

| Campo | Valor |
|---|---|
| Horas estimadas | `0` |
| Saturación | `Alta` |
| Alpha | `1` |
| Horas disponibles | `160` |

Resultado esperado:

```text
F_C = EXP(0) = 1
Modo capacidad = Capacidad por horas
```

Nota: si se considera que cero horas no es válido operativamente, puede agregarse validación para impedir `0`. Sin embargo, matemáticamente la fórmula funciona.

---

## 15. Validación de datos recomendada

### 15.1 Horas estimadas

`INPUT_PROYECTO!B8` debe permitir:

- vacío;
- número mayor o igual a cero.

No debe permitir texto.

### 15.2 Saturación

`INPUT_PROYECTO!B9` debe permitir:

- vacío;
- Baja;
- Media;
- Alta;
- Crítica.

Debe usarse validación por lista.

---

## 16. Formato condicional recomendado

### 16.1 Celda de saturación `INPUT_PROYECTO!B9`

Si `B8` contiene horas, entonces la saturación está siendo ignorada. Se recomienda mostrar una nota o color gris.

Regla conceptual:

```text
Si B8 no está vacío, B9 queda como información no usada.
```

Puede implementarse con formato condicional o una celda auxiliar.

### 16.2 Celda de `F_C`

| Condición | Formato recomendado |
|---|---|
| `F_C >= 0,75` | Verde |
| `0,45 <= F_C < 0,75` | Amarillo |
| `F_C < 0,45` | Rojo |
| Texto `"Falta dato capacidad"` | Naranja o rojo |
| Texto `"Revisar horas disponibles"` | Rojo |

---

## 17. Errores comunes que Codex debe evitar

1. No sumar horas y saturación.
2. No multiplicar la saturación por otro factor adicional.
3. No usar saturación si existen horas estimadas.
4. No dejar que el VEC calcule con texto.
5. No convertir una falta de dato en `NO-BID`.
6. No modificar CT con saturación.
7. No modificar Tₒ con saturación.
8. No usar punto decimal en fórmulas de Excel en español.
9. No usar coma como separador de argumentos.
10. No escribir `Critica` si la tabla dice `Crítica`.

---

## 18. Relación con CT, Tₒ e IP

La saturación no afecta directamente el CT ni el Tₒ.

Sin embargo, sí afecta indirectamente el IP mediante el VEC.

Flujo:

```text
Saturación → F_C → VEC → IP
```

Dado que:

```text
IP = VEC / Tₒ
```

Si la saturación baja el `F_C`, también baja el VEC y, por consecuencia, baja el IP.

Pero `Tₒ` se mantiene igual porque depende del CT.

---

## 19. Criterio metodológico

La saturación debe entenderse como una variable cualitativa de respaldo cuando no existe una estimación cuantitativa de horas.

Esto permite que la herramienta funcione en dos escenarios:

1. **Escenario con información suficiente:** se usan horas estimadas.
2. **Escenario temprano o incierto:** se usa saturación cualitativa.

Esta lógica mantiene la herramienta práctica sin obligar al usuario a estimar horas cuando aún no existe suficiente información.

---

## 20. Resultado esperado final

Al finalizar la implementación, la herramienta debe cumplir estas reglas:

```text
1. Si hay horas, F_C se calcula por horas.
2. Si no hay horas y hay saturación, F_C se calcula por tabla.
3. Si no hay horas ni saturación, se alerta falta de dato.
4. Saturación no modifica CT.
5. Saturación no modifica Tₒ.
6. Saturación no modifica P, I ni M.
7. Saturación solo afecta VEC mediante F_C.
8. VEC no debe calcular si F_C no es numérico.
9. La decisión no debe devolver NO-BID por falta de dato.
10. IP se calcula solo si VEC y Tₒ son numéricos.
```

---

## 21. Nota final para Codex

El objetivo no es rediseñar la lógica del modelo, sino asegurar que el campo `Nivel de saturación` funcione como un respaldo cualitativo del factor capacidad.

Cualquier modificación debe respetar la jerarquía:

```text
Horas estimadas > Saturación > Falta dato
```

Y debe preservar el principio:

```text
La saturación solo alimenta F_C.
```
