

async function  guardarNombre () {
    const { value: tagname } = await Swal.fire({
        title: "Ingresa tu nombre",
        input: "text",
        inputLabel: "tagname",
        inputPlaceholder: "Ingresa tu nombre",
        inputAttributes: {
          maxlength: "6",
          minlength: "4",
          autocapitalize: "off",
          autocorrect: "off"
        }
      });

    if (!tagname) {
        Swal.fire("nombre no valido.");
    }
    else {
        localStorage.setItem("flip43_tagname", tagname);
        console.log(tagname);
        uiActualizarNombre(tagname);
    }
}


function uiActualizarNombre(tagname) {
    if (tagname) {
      const contBienvenido = document.getElementById('bienvenido');
      if (contBienvenido) {

        // Eliminar cualquier elemento hijo antes de agregar uno nuevo
        while (contBienvenido.firstChild) {
            contBienvenido.removeChild(contBienvenido.firstChild);
        }

        const p = document.createElement('p');
        p.textContent = `Hola, ${tagname}`;
        contBienvenido.appendChild(p);
      }
    }
}

export function alert_mensaje(mensaje){
    Swal.fire({
        title: mensaje,
        icon: "warning",
        draggable: true
      });
}

document.getElementById("btn-guardar-nombre").addEventListener("click", guardarNombre);
