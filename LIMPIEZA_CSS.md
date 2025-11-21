# Limpieza de CSS en plataforma-futbol-limpia

## Archivos CSS que puedes eliminar (no se usan ni se importan):
- src/pages/Eventos.css
- src/pages/DashboardClub.css
- src/pages/DetalleEvento.css
- src/pages/GestionJugadores.css
- src/pages/GestionRolesPage.css
- src/pages/PlayerForm.css
- src/styles/theme.css
- src/styles/home.css
- src/styles/club.css

## Archivos CSS que sí se usan (importados en JSX):
- src/components/EstadisticasAnalisis.css
- src/components/ModalEdicionEvaluacion.css
- src/components/GestionEventos.css
- src/components/EvaluacionRapida.css
- src/components/EvaluacionJugadorModal.css
- src/components/CampoDeJuego.css
- src/components/AppLayout.css
- src/components/EventoForm.css
- src/pages/Configuracion.css

## Recomendaciones:
- Migra los estilos de los archivos que sí se usan a Tailwind cuando sea posible.
- Mantén solo los CSS importados explícitamente y que no puedas migrar aún.
- Elimina los archivos listados arriba para evitar confusión y mejorar la consistencia visual.

---

¿Quieres que elimine automáticamente los archivos no usados y te ayude a migrar algún estilo específico a Tailwind?
