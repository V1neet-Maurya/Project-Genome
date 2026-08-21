const calculateTotal = (items) => {
  let total = 0;
  for (const item of items) {
    total += item.price * item.quantity;
  }
  return total;
};

function greetUser(name) {
  return "Hello, " + name + "!";
}

const products = [
  { name: "Keyboard", price: 1200, quantity: 2 },
  { name: "Mouse", price: 700, quantity: 1 }
];

console.log(greetUser("Genome Tester"));
console.log("Total:", calculateTotal(products));
