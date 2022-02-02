const express = require('express')
const { Server: HttpServer } = require("http");
const { Server: IOServer } = require('socket.io')
const ContenedorArchivo = require('./contenedor/contenedorArchivo')

//sesiones
const cookieParser = require('cookie-parser')
const session = require('express-session')

//mongo
const MongoStore = require('connect-mongo')

const faker = require('faker')
const app = express()
const httpServer = new HttpServer(app)
const io = new IOServer(httpServer)

faker.locale = 'es_MX'
const listaProductos = []
let listaMensajes = [];
let lista = [];
let nombreSession = ""

const listaMensajesChat = new ContenedorArchivo('mensajes.json')
//const listaProductos = new ContenedorArchivo('productos.json')

app.use(express.static('./public'))
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
//sesiones
app.use(cookieParser())
app.use(session({
    //store: new MongoStore({ mongoUrl: 'mongodb+srv://nuyc26:amalia32N@cluster0.b8cbj.mongodb.net/sesiones' }),
    store: new MongoStore({ mongoUrl: 'mongodb+srv://nuyc26:amalia32N@cluster0.xn1wu.mongodb.net/sesiones?retryWrites=true&w=majority' }),
    secret: 'miSecret',
    resave: false,
    cookie: { maxAge: 30000 },
    saveUninitialized: false
}))


app.set('views', './public/views')
app.set('view engine', 'ejs');

app.get('/', (req, resp) => {
    console.log(req.session);

    if (req.session.name) {
        nombreSession = req.session.name
    }else{
        nombreSession = ""
    }

    if (listaProductos.length <= 0) {
        for (let index = 0; index < 5; index++) {
            listaProductos.push(creaProducto())
        }
    }

    resp.render('layouts/index', {
        productos: listaProductos,
        nombreSession
    })
    //resp.send(listaProductos)
    //resp.send('listaProductos')
})

//vista de lista
app.post('/productos', function (req, res) {
    console.log("body", req.body);
    let nuevoProducto = {
        timestamp: faker.datatype.datetime(),
        codigo: faker.datatype.datetime(),
        nombre: req.body.title,
        descripcion: req.body.title,
        precio: req.body.price,
        foto: faker.image.imageUrl(),
        stock: faker.datatype.number() + "",
        id: faker.datatype.number()
    }
    //const ultimoProducto = listaProductos.save(nuevoProducto);
    //console.log(ultimoProducto); 
    listaProductos.push(nuevoProducto)

    res.render('layouts/index', {
        productos: listaProductos
    })
    //res.render.redirect("/lista")
})

//login
//vista de lista
app.post('/login', function (req, res) {

    console.log("body", req.body);
    if (req.session.name) {
        nombreSession = req.body.nombreUser
    }else{
        nombreSession = req.session.name = req.body.nombreUser
    }

    res.render('layouts/index',  {
        productos: listaProductos,
        nombreSession
    })
})


//logout
app.get('/logout', function (req, res) {
    const nombre = nombreSession
    nombreSession = ""
    req.session.destroy()
    res.render('layouts/logout',{
        nombre:nombre
    })
    //res.render.redirect("/lista")
})

function creaProducto() {
    return {
        timestamp: faker.datatype.datetime(),
        nombre: faker.commerce.productName(),
        descripcion: faker.commerce.productDescription(),
        codigo: faker.finance.currencyCode(),
        precio: faker.commerce.price(),
        stock: faker.datatype.number() + "",
        foto: faker.image.imageUrl(),
        id: faker.datatype.number()
    }
}

//listen 
httpServer.listen(3000, function () {
    console.log('3000 es mi puerto');
})


io.on('connection', (socket) => {

    //emite mensajes
    socket.emit('mensajes', listaMensajes)

    socket.on("new-mensaje", data => {
        listaMensajes.push(data);
        console.log("data mensaje: ", data);
        io.sockets.emit("mensajes", [data])
    })

})