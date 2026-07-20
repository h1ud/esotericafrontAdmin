# Guía de Estilo UI – Minimalista, Elegante y Orgánica

## Concepto General

La interfaz debe transmitir una sensación **minimalista, cálida, elegante y relajante**, inspirada en cafeterías artesanales, papelería premium y diseño editorial moderno.

Evitar colores saturados o contrastes excesivos.

Todo el sistema debe mantener una apariencia limpia, con abundante espacio en blanco (off-white) y elementos de gran radio de borde.

---

# Paleta de colores

## Primary

Color principal utilizado para:

- Botones principales
- Estados activos
- Iconos seleccionados
- Indicadores

```css
Primary: #B98D8D
```

Escala aproximada:

```text
#2B1112
#442223
#603B3C
#7C5A5B
#987274
#B98D8D
#C8A2A2
#D8B7B7
#E8CCCC
#F3E2E2
#FBF3F3
```

---

## Secondary

Verde salvia desaturado.

Utilizado para:

- Confirmaciones
- Indicadores secundarios
- Botones alternativos
- Elementos decorativos

```css
Secondary: #8DA399
```

Escala:

```text
#071612
#173028
#2D4941
#48645A
#658077
#8DA399
#A7BBB1
#C2D2CA
#D9E6E0
#EDF5F1
```

---

## Tertiary

Lavanda grisáceo.

Ideal para:

- Badges
- Estados informativos
- Iconografía
- Decoración

```css
Tertiary: #A594B0
```

Escala:

```text
#1D1527
#30263C
#473D56
#645977
#847A97
#A594B0
#B7A8C2
#CCBED5
#E3D9EA
#F4EDF7
```

---

## Neutral

Color dominante del sistema.

```css
Background: #F9F5F0
```

Escala:

```text
#111111
#252525
#3D3D3D
#565656
#737373
#949494
#B3B3B3
#D4D4D4
#ECE8E2
#F9F5F0
#FFFFFF
```

---

# Tipografía

## Headings

Fuente:

```
Noto Serif
```

Características:

- Elegante
- Editorial
- Ligero contraste
- Ideal para títulos

Peso recomendado:

```css
font-weight: 500;
```

---

## Body

Fuente:

```
Plus Jakarta Sans
```

Características:

- Moderna
- Muy legible
- Bordes suaves
- Excelente para interfaces

Pesos recomendados:

```css
400
500
600
```

---

## Tamaños sugeridos

```css
Display
56px

H1
42px

H2
34px

H3
28px

H4
22px

Body
16px

Small
14px

Label
13px
```

---

# Botones

## Primary Button

```css
background: #8C6767;
color: white;
border-radius: 10px;
padding: 12px 24px;
```

Hover:

```css
background: #7A5757;
```

---

## Secondary Button

```css
background: #F4F0EB;
color: #5D5552;
border: none;
```

---

## Outline Button

```css
background: transparent;
border: 1px solid #8C7D72;
color: #6B635D;
```

---

## Inverted Button

```css
background: #121212;
color: white;
```

---

# Inputs

Estilo:

```css
background: #F7F3EF;
border: 1px solid #D6CDC4;
border-radius: 10px;
height: 48px;
```

Placeholder:

```css
color: #9B928B;
```

Focus:

```css
border-color: #B98D8D;
box-shadow: 0 0 0 3px rgba(185,141,141,.18);
```

---

# Cards

```css
background: #F9F5F0;
border-radius: 22px;
padding: 28px;
```

Sombras:

```css
box-shadow:

0 3px 12px rgba(0,0,0,.04),
0 8px 30px rgba(0,0,0,.03);
```

No utilizar sombras oscuras.

---

# Bordes

Todos los componentes poseen bordes redondeados.

```css
Inputs
10px

Botones
10px

Cards
22px

Badges
12px

FAB
999px
```

---

# Iconografía

Estilo:

- Outline
- Trazo fino
- Minimalista
- Monocromática

Color por defecto:

```css
#5F5A56
```

Activo:

```css
#8C6767
```

---

# Navegación inferior

Fondo:

```css
#F7F3EF
```

Elemento activo:

```css
background: #8C6767;
color: white;
```

Elementos inactivos:

```css
color: #6F6A66;
```

Radio:

```css
999px
```

---

# Barras de progreso

Altura:

```css
6px
```

Radio:

```css
999px
```

Colores:

Primary

```css
#8C6767
```

Secondary

```css
#6F897B
```

Tertiary

```css
#8B789C
```

Track

```css
#EEE9E5
```

---

# Etiquetas (Badges)

Radio:

```css
10px
```

Padding:

```css
8px 14px
```

Ejemplos:

Success

```css
background: #DCEEE5;
color: #587565;
```

Info

```css
background: #EBDDFA;
color: #7A5A93;
```

Warning

```css
background: #FDE2E2;
color: #9A5E5E;
```

---

# Botones flotantes circulares

Diámetro:

```css
44px
```

Radio:

```css
999px
```

Ejemplo de colores:

```css
Primary   #8C6767
Secondary #6E8578
Purple    #7E6A8E
Orange    #A44E2A
```

Iconos:

```css
color: white;
```

---

# Espaciado

Sistema base:

```css
4
8
12
16
20
24
32
40
48
64
```

Se recomienda trabajar siempre sobre múltiplos de 8.

---

# Animaciones

Todas las animaciones deben ser sutiles.

Duración:

```css
180ms
220ms
280ms
```

Curva:

```css
cubic-bezier(.2,.8,.2,1)
```

Hover:

- Elevación ligera
- Cambio suave de color
- Escala máxima:

```css
scale(1.02)
```

No utilizar rebotes exagerados.

---

# Filosofía Visual

La interfaz debe transmitir:

- Elegancia
- Serenidad
- Artesanía
- Sofisticación
- Minimalismo
- Diseño editorial
- Sensación premium
- Colores orgánicos
- Mucho espacio negativo
- Componentes suaves
- Animaciones discretas
- Contrastes moderados
- Aspecto contemporáneo inspirado en cafeterías boutique, marcas de cosmética premium y aplicaciones modernas como Notion, Linear y Stripe.
