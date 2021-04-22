const Tarea = require("../models/Tarea");
const Proyecto = require("../models/Proyecto");
const { validationResult } = require("express-validator");

// Crea una nueva tarea
exports.crearTarea = async (req, res) => {
  // Revisar si hay errores
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array() });
  }

  //Extraer el proyecto y comprobar si existe
  const { proyecto } = req.body;
  try {
    const existeProyecto = await Proyecto.findById(proyecto);
    if (!existeProyecto) {
      return res.status(404).json({ msg: "Proyecto no encontrado" });
    }

    // Verificar el creador del proyecto
    if (existeProyecto.creador.toString() !== req.usuario.id) {
      return res.status(401).json({ msg: "No autorizado" });
    }

    // Creamos la tarea
    const tarea = new Tarea(req.body);
    await tarea.save();
    res.json({ tarea });
  } catch (error) {
    console.log(error);
    res.status(500).send("Hubo un error");
  }
};

// Obtiene las tareas por proyecto
exports.obtenerTareas = async (req, res) => {
  try {
    //Extraer el proyecto y comprobar si existe
    const { proyecto } = req.query;
    // Extraer el proyecto y comprobar si existe
    const existeProyecto = await Proyecto.findById(proyecto);
    if (!existeProyecto) {
      return res.status(404).json({ msg: "Proyecto no encontrado" });
    }

    // Verificar el creador del proyecto
    if (existeProyecto.creador.toString() !== req.usuario.id) {
      return res.status(401).json({ msg: "No autorizado" });
    }

    // Obtener las tareas por proyectos
    const tareas = await Tarea.find({ proyecto }).sort({ creado: -1 });
    res.json({ tareas });
  } catch (error) {
    console.log(error);
    res.status(500).send("Hubo un error");
  }
};

// Actualizar una tarea
exports.actualizarTarea = async (req, res) => {
  try {
    //Extraer el proyecto y comprobar si existe
    const { proyecto, nombre, estado } = req.body;

    // Si la tarea existe o no
    let tareaExiste = await Tarea.findById(req.params.id);
    if (!tareaExiste) {
      return res.status(404).json({ msg: "No existe esa tarea" });
    }

    // Extraer proyecto
    const existeProyecto = await Proyecto.findById(proyecto);

    // Verificar el creador del proyecto
    if (existeProyecto.creador.toString() !== req.usuario.id) {
      return res.status(401).json({ msg: "No autorizado" });
    }

    // Crear un objeto con la nueva informacion
    const nuevaTarea = {};
    nuevaTarea.nombre = nombre;
    nuevaTarea.estado = estado;

    // Guardar la tarea
    tareaExiste = await Tarea.findByIdAndUpdate(
      { _id: req.params.id },
      nuevaTarea,
      { new: true }
    );
    res.json({ tareaExiste });
  } catch (error) {
    console.log(error);
    res.status(500).send("Hubo un error");
  }
};

// Eliminar una tarea
exports.eliminarTarea = async (req, res) => {
  try {
    //Extraer el proyecto y comprobar si existe
    const { proyecto } = req.query;

    // Si la tarea existe o no
    let tareaExiste = await Tarea.findById(req.params.id);
    if (!tareaExiste) {
      return res.status(404).json({ msg: "No existe esa tarea" });
    }

    // Extraer proyecto
    const existeProyecto = await Proyecto.findById(proyecto);

    // Verificar el creador del proyecto
    if (existeProyecto.creador.toString() !== req.usuario.id) {
      return res.status(401).json({ msg: "No autorizado" });
    }

    // Eliminar
    await Tarea.findByIdAndRemove({ _id: req.params.id });
    res.json({ msg: "Tarea Eliminada" });
  } catch (error) {
    console.log(error);
    res.status(500).send("Hubo un error");
  }
};
