function esperar(ms) {
  return new Promise(resolve => {
    setTimeout(() => resolve("Listo después de " + ms + "ms"), ms);
  });
}

async function ejemplo() {
  const promesa = esperar(1000);
  console.log(promesa); // Solo imprime la promesa, no el valor resuelto
}

// ?
const user = {
  name: "Lucia",
  greet(){
    return "Hola"; 
  }
};

console.log(user.name);
console.log(user.greet());
console.log(user.sayBye?.());


const users = [
  {name: "juanita"},
  {name: "bananita"}
]

console.log(users[0]?.name);
console.log(users[1]?.name);
console.log(users[5]?.name);

const persona = {
  nombre: "Maria",
  direccion: null
};

console.log(persona?.apellido || "No tiene apellido");

const utils = {
  saludar: () => "Hola Mundo"
};

console.log(utils.saludar?.());
console.log(utils.despedirse?.());
