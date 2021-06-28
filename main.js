const listaProductos = document.querySelector('.lista-productos')
const items = document.getElementById('items')
const footer = document.getElementById('footer')
const template = document.getElementById('template-card').content
const templateCarrito = document.getElementById('template-carrito').content
const templateFooter = document.getElementById('template-footer').content
const fragment = new DocumentFragment()
let carroCompras = {}

document.addEventListener('DOMContentLoaded', () => {
    fetchApi()
    if(localStorage.getItem('carroCompras')){
        carroCompras = JSON.parse(localStorage.getItem('carroCompras'))
        pintarProducto()
    }
})
listaProductos.addEventListener('click', click => {
    seleccionarProducto(click)
})
items.addEventListener('click', click => {
    sumaResta(click)
})

const fetchApi = async () => {
    try{
        const data = await fetch('./api.json')
        const dataJson = await data.json()
        pintarCards(dataJson)
    }
    catch(error){
        console.log(error)
    }
}

const pintarCards = dataJson => {
    dataJson.forEach( producto => {
        template.querySelector('img').setAttribute('src', producto.thumbnailUrl)
        template.querySelector('h5').textContent = producto.title
        template.querySelector('p').textContent = producto.precio
        template.querySelector('button').dataset.id = producto.id

        const clone = template.cloneNode(true)
        fragment.appendChild(clone)
    })
    listaProductos.appendChild(fragment)
} 

const seleccionarProducto = click => {
    if(click.target.classList.contains('btn-dark')){
        const productoEnCarro =  click.target.parentElement
        addProducto(productoEnCarro)
    }
    click.stopPropagation()
}

const addProducto = productoEnCarro => {
    const productolisto = {
        id: productoEnCarro.querySelector('.btn-dark').dataset.id,
        title: productoEnCarro.querySelector('h5').textContent,
        precio: productoEnCarro.querySelector('p').textContent,
        cantidad: 1,
    }
    if(carroCompras.hasOwnProperty(productolisto.id)){
        productolisto.cantidad = carroCompras[productolisto.id].cantidad + 1
    }
    carroCompras[productolisto.id] = {...productolisto}  
    pintarProducto()
}

const pintarProducto = () =>{
    items.innerHTML = ''
    Object.values(carroCompras).forEach(productoListo => {
        templateCarrito.querySelector('th').textContent = productoListo.id
        templateCarrito.querySelectorAll('td')[0].textContent = productoListo.title
        templateCarrito.querySelectorAll('td')[1].textContent = productoListo.cantidad
        templateCarrito.querySelector('.btn-info').dataset.id = productoListo.id
        templateCarrito.querySelector('.btn-danger').dataset.id = productoListo.id
        templateCarrito.querySelector('span').textContent = productoListo.cantidad * productoListo.precio

        const clone = templateCarrito.cloneNode(true)
        fragment.appendChild(clone)
    })
    items.appendChild(fragment)
    pintarFooter()

    localStorage.setItem('carroCompras', JSON.stringify(carroCompras))
}

const pintarFooter = () => {
    footer.innerHTML = ''
    if(Object.keys(carroCompras).length === 0){
        footer.innerHTML = `
        <th scope="row" colspan="5">Carrito vacío - comience a comprar!</th>
        `
        return
    }

    const ncantidad = Object.values(carroCompras).reduce((acc, {cantidad}) => acc + cantidad, 0 )
    const nprecio = Object.values(carroCompras).reduce((acc, {cantidad, precio}) => acc + cantidad * precio, 0 )

    templateFooter.querySelectorAll('td')[0].textContent = ncantidad
    templateFooter.querySelector('span').textContent = nprecio

    const clone = templateFooter.cloneNode(true)
    fragment.appendChild(clone)
    footer.appendChild(fragment)

    const vaciarCarrito = document.getElementById('vaciar-carrito')
    vaciarCarrito.onclick = () => {
        carroCompras= {}
        pintarProducto()
    }
}

const sumaResta = click => {
    if(click.target.classList.contains('btn-info')){
        let producto = carroCompras[click.target.dataset.id]
        producto.cantidad++
        producto = {...producto}
        pintarProducto()
    }
    else if(click.target.classList.contains('btn-danger')){
        let producto = carroCompras[click.target.dataset.id]
        producto.cantidad--
        if(producto.cantidad === 0){
            delete carroCompras[click.target.dataset.id]
        }
        pintarProducto()
    }
    click.stopPropagation()
}
