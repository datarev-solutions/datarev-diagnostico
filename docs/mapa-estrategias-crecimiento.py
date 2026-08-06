import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.lines import Line2D

NAVY_900 = "#04081f"
NAVY_800 = "#08123a"
LINE = "#172a5e"
INK = "#eaf1ff"
MUTED = "#aab4d4"
FAINT = "#7b87ad"
S1 = "#1763ff"
S2 = "#d95926"
S3 = "#199e70"

items = [
    (1, "Máquina de referencias", "a", 2, 9),
    (2, "Marca personal / expertise visible", "a", 2, 7),
    (3, "Casos de éxito con cifras", "a", 2, 6),
    (4, "Expansión de cuenta actual", "a", 2, 9),
    (5, "Employee advocacy en LinkedIn", "a", 2, 5),
    (6, "Alianzas informales (ISVs)", "a", 4, 6),
    (7, "Webinar o podcast propio", "a", 4, 5),
    (8, "Investigación original (estudio anual)", "b", 6, 9),
    (9, "Evento propio", "b", 7, 9),
    (10, "Hablar en conferencias", "b", 5, 8),
    (11, "SEO / GEO", "b", 6, 6),
    (12, "Relaciones con analistas (Gartner/Forrester)", "b", 8, 6),
    (13, "Premios y rankings de industria", "b", 3, 3),
    (14, "Partner cloud certificado (AWS/Azure/GCP)", "b", 4, 9),
    (15, "Assessment o diagnóstico gratuito", "c", 5, 4),
    (16, "Cold email", "c", 2, 3),
    (17, "Outbound multicanal (email+LinkedIn+tel)", "c", 4, 5),
    (18, "Pauta pagada (LinkedIn/Google Ads)", "c", 3, 2),
    (19, "Marketplaces de consultoría (Catalant/Toptal/GLG)", "c", 4, 5),
    (20, "Contratar un rainmaker senior", "c", 8, 7),
    (21, "Optimizar respuesta a RFPs", "c", 6, 3),
    (22, "Reseñas B2B (Clutch/G2)", "c", 2, 3),
    (23, "Productización de ofertas", "c", 4, 7),
    (24, "Especialización vertical o de nicho", "c", 5, 8),
    (25, "Fusión o adquisición de equipo/cartera", "c", 9, 7),
    (26, "Publicidad tradicional (TV/radio/prensa)", "c", 7, 2),
]

cat_style = {
    "a": {"color": S1, "marker": "o", "label": "Orgánico y relaciones"},
    "b": {"color": S2, "marker": "s", "label": "Autoridad y visibilidad"},
    "c": {"color": S3, "marker": "^", "label": "Adquisición pagada y estructural"},
}

# A few strategies share an identical (dificultad, beneficio) score. Nudge
# each member of a duplicate/triple apart so every marker and number label
# stays legible instead of stacking into one illegible glyph. (4,5) is a
# three-way tie (7, 17, 19) — arranged as a small triangle, not a pair.
jitter = {1: (-0.16, 0.14), 4: (0.16, -0.14),
          16: (-0.16, 0.14), 22: (0.16, -0.14),
          10: (-0.16, 0.14), 24: (0.16, -0.14),
          7: (0, 0.22), 17: (-0.20, -0.13), 19: (0.20, -0.13)}

fig = plt.figure(figsize=(15, 9.2), dpi=200)
fig.patch.set_facecolor(NAVY_900)

ax = fig.add_axes([0.055, 0.155, 0.50, 0.735])
ax.set_facecolor(NAVY_800)

for spine in ax.spines.values():
    spine.set_color(LINE)
ax.tick_params(colors=MUTED, labelsize=9)
ax.set_xlim(0.3, 10.4)
ax.set_ylim(0.3, 10.75)
ax.set_xticks(range(1, 11, 1))
ax.set_yticks(range(1, 11, 1))
ax.grid(True, color=LINE, linewidth=0.6, alpha=0.5)
ax.set_axisbelow(True)

ax.axvline(5.5, color=FAINT, linestyle=(0, (4, 4)), linewidth=1)
ax.axhline(5.5, color=FAINT, linestyle=(0, (4, 4)), linewidth=1)

ax.set_xlabel("Dificultad de implementación  →", color=MUTED, fontsize=11, labelpad=10)
ax.set_ylabel("Beneficio compuesto  →", color=MUTED, fontsize=11, labelpad=10)

# Clear of the highest/lowest data points (y=9 / y=2) by a full point of
# headroom, so the italic quadrant labels never sit on top of a marker.
quad_kw = dict(fontsize=9.5, color=FAINT, style="italic")
ax.text(0.5, 10.55, "Ganancias rápidas", ha="left", va="top", **quad_kw)
ax.text(10.2, 10.55, "Apuestas grandes", ha="right", va="top", **quad_kw)
ax.text(0.5, 0.45, "Rellenos", ha="left", va="bottom", **quad_kw)
ax.text(10.2, 0.45, "Evitar por ahora", ha="right", va="bottom", **quad_kw)

for num, name, cat, x, y in items:
    dx, dy = jitter.get(num, (0, 0))
    px, py = x + dx, y + dy
    st = cat_style[cat]
    ax.scatter(
        px, py, s=170, c=st["color"], marker=st["marker"],
        edgecolors=NAVY_800, linewidths=1.4, zorder=3,
    )
    ax.annotate(
        str(num), (px, py), textcoords="offset points", xytext=(0, 9),
        ha="center", fontsize=8, color=INK, fontweight="bold", zorder=4,
    )

legend_handles = [
    Line2D([0], [0], marker=cat_style[k]["marker"], color="none",
           markerfacecolor=cat_style[k]["color"], markeredgecolor=NAVY_800,
           markersize=10, label=cat_style[k]["label"])
    for k in ["a", "b", "c"]
]
fig.legend(
    handles=legend_handles, loc="lower center", bbox_to_anchor=(0.305, 0.048),
    ncol=3, frameon=False, fontsize=9.5, labelcolor=MUTED, handletextpad=0.6,
    columnspacing=1.4,
)

ax.set_title(
    "Mapa de 26 estrategias de crecimiento — DataRev",
    color=INK, fontsize=14, fontweight="bold", pad=14, loc="left",
)

ax_list = fig.add_axes([0.60, 0.035, 0.38, 0.92])
ax_list.set_facecolor(NAVY_900)
ax_list.axis("off")

quadrants = [
    ("GANANCIAS RÁPIDAS", S1, [1, 4, 14, 2, 23, 10, 24, 3, 6]),
    ("APUESTAS GRANDES", S2, [9, 8, 20, 25, 11, 12]),
    ("RELLENOS", MUTED, [15, 5, 7, 17, 19, 13, 16, 22, 18]),
    ("EVITAR POR AHORA", "#e66767", [21, 26]),
]
by_id = {n: (name, cat) for n, name, cat, x, y in items}

# 34 total lines (4 titles + 26 items + 4 inter-section gaps) must fit inside
# axes-fraction [0, 1] with room to spare — a too-large line_h here is what
# pushed "EVITAR POR AHORA" down into the footnote in the first draft.
y_cursor = 0.99
line_h = 0.026
for title, color, ids in quadrants:
    ax_list.text(0, y_cursor, title, color=color, fontsize=10.5,
                 fontweight="bold", transform=ax_list.transAxes, va="top")
    y_cursor -= line_h * 1.4
    for i in ids:
        name, cat = by_id[i]
        ax_list.text(0.02, y_cursor, f"{i}", color=INK, fontsize=9,
                     fontweight="bold", transform=ax_list.transAxes, va="top")
        ax_list.text(0.075, y_cursor, name, color=MUTED, fontsize=9,
                     transform=ax_list.transAxes, va="top")
        y_cursor -= line_h
    y_cursor -= line_h * 0.7

fig.text(
    0.055, 0.015,
    "Dificultad y beneficio: síntesis cualitativa sobre la investigación citada, escala 1-10. No es un solo estudio con una sola escala.  ·  DataRev · Data Revolution · 6-ago-2026",
    color=FAINT, fontsize=8, ha="left",
)

out = "/Users/dantetellez/datarev-diagnostico/docs/mapa-estrategias-crecimiento.png"
fig.savefig(out, facecolor=fig.get_facecolor(), bbox_inches="tight", pad_inches=0.25)
print("saved:", out)
