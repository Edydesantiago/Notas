const express = require('express');
const router = express.Router();

//Modelo de datos para las notas
const Nota = require('../model/Notes');

//Autenticación de usuarios
const { isAuthenticated } = require('../helpers/auth');

//Ruta para agregar notas
router.get('/notes/add', isAuthenticated, (req, res)=>{
    res.render('notes/nueva-nota');
});

//Ruta para listar las notas
router.get('/notes',isAuthenticated, async (req, res)=>{
    //res.send('Notas de la base de datos');
    await Nota.find({usuario: req.user._id})
              .lean().sort({fecha:'desc'})
              .then( (notas)=>{
                  //console.log(notas);
                  //res.send("Notas");
                  res.render('notes/consulta-notas',{notas})
              })
              .catch( (err)=>{
                  console.log(err);
                  res.redirect('error');
              })
});//Fin del método para listar las notas
// ruta para listar por categoria
// En tu ruta de listar notas (routes/notes.js)

router.get('/notes', isAuthenticated, async (req, res) => {
    const categoriaFiltrada = req.query.categoria; // Obtener la categoría desde la consulta

    const filtro = { usuario: req.user._id };
    if (categoriaFiltrada) {
        filtro.categoria = categoriaFiltrada;
    }

    try {
        const notas = await Nota.find(filtro).lean().sort({ fecha: 'desc' });
        res.render('notes/consulta-notas', { notas, categoriaFiltrada });
    } catch (err) {
        console.log(err);
        res.redirect('/error');
    }
});
//fin categoria

//Cuando el formulario presione enviar
router.post('/notes/nueva-nota', isAuthenticated, async (req, res)=>{
    //req.body contiene todos los datos enviados desde el servidor
    //console.log(req.body);

    //Obtenemos los datos en constantes
    const {titulo, descripcion} = req.body;
    const errores = [];

    if (!titulo)
        errores.push({text: ' Por favor inserta el título'});

    if (!descripcion)
        errores.push({text: 'Por favor inserta la descripción'})

    if (errores.length > 0)
        res.render('notes/nueva-nota', {
            errores,
            titulo,
            descripcion
        });
    else{
        const id = req.user._id;
        const nuevaNota = new Nota({titulo, descripcion, usuario:id});
        await nuevaNota.save() //await guarda la nota en la db de manera asíncrona
                       .then( ()=>{
                          //Enviamos un mensaje al fronend indicando que la nota se almaceno
                          req.flash('success_msg', 'Nota agregada de manera exitosa');
                          //Redirigimos el flujo de la app a la lista de todas las notas
                          res.redirect('/notes');
                       })
                       .catch( (err)=>{
                          console.log(err);
                          //En caso de algún error redirigimos a una página de error
                          res.redirect('/error');
                       })
        //console.log(nuevaNota);
        //res.send("ok");
    }    
}); //Fin del método nueva-nota

//Ruta para editar una nota
router.get('/notes/edit:id', isAuthenticated, async (req, res)=>{
    //console.log(req.params.id);
    //Obtener el ObjectId que viene de la URL
    //Eliminamos los dos puntos que se incluyen al inicio
    try{
        var _id = req.params.id;
        var len = req.params.id.length;
        //Extrae una subcadena de la posición 1 a la logngitud total
        //del id, porque la posición 0 del id son los :
        //que vamos a eliminar
        _id = _id.substring(1, len);
        const nota = await Nota.findById(_id);
        id_ = nota._id
        var titulo = nota.titulo;
        var descripcion = nota.descripcion;
        res.render('notes/editar-nota',
                   {titulo, descripcion, _id})
    }
    catch(error){
        console.log(error);
        res.redirect('/error');
    }
});//Fin de editar nota

//Ruta para guardar una nota editada en la bd
router.put('/notes/editar-nota/:id', isAuthenticated, async (req, res)=>{
    const {titulo, descripcion} = req.body;
    const _id = req.params.id;
    //console.log(titulo, descripcion,_id);
    const errores = [];

    if (!titulo)
        errores.push({text: ' Por favor inserta el título'});

    if (!descripcion)
        errores.push({text: 'Por favor inserta la descripción'});
    
    if (errores.length > 0){
        res.render('notes/editar-nota', {
            errores,
            titulo,
            descripcion
        })
    }
    else{ //No hay errores se actualiza la nota en la bd
        await Nota.findByIdAndUpdate(_id, {titulo, descripcion}) 
                  .then( ()=>{
                    //Enviamos un mensaje al fronend indicando que la nota se almaceno
                    req.flash('success_msg', 'Nota actualizada de manera exitosa');
                    res.redirect('/notes');
                  })
                  .catch( (err)=>{
                    console.log(err);
                    res.redirect('/error');
                  })

    }//else
})//Fin de guardar nota editada

//Ruta para eliminar una nota
router.get('/notes/delete:id', isAuthenticated, async (req, res)=>{
    //Eliminar los dos puntos del id
    try {
         var _id = req.params.id;
         _id = _id.substring(1);
         await Nota.findByIdAndDelete(_id);
         req.flash('success_msg', 'Nota eliminada correctamente');
         res.redirect('/notes/')
    } catch (error) {
        res.send(404);
        console.log(error);
        res.redirect('/error')
    }
});//Fin de eliminar nota

module.exports = router;
