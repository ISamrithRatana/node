
//

let order = [];
function orderItem(item, price) {
    const existingItem = order.find(orderItem => orderItem.name === item);
    if (existingItem) {
        existingItem.count++;
    } else {
        order.push({ name: item, price: price, count: 1 });
    }
    updateOrderList();
}

function updateOrderList() {
    const orderList = document.getElementById('order-list');
    orderList.innerHTML = '';
    let totalPrice = 0;
    order.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item.name}  ${item.count} x $${item.price.toFixed(2)}`;
        orderList.appendChild(li);
        totalPrice += item.price * item.count;
    });
    document.getElementById('total-price').textContent = totalPrice.toFixed(2);
}

function View() {
    if (order.length === 0) {
        alert('Your order is empty.');
    } else {
        const orderSummary = order.map(item => `${item.name} x ${item.count}`).join(', ');
        const totalPrice = order.reduce((total, item) => total + item.price * item.count, 0).toFixed(2);
        alert(`Order placed: ${orderSummary}. Total: $${totalPrice}`);
    }
}

function removeOrder() {
    order = [];
    updateOrderList();
}

function printDiv(divId) {
    // var divContent = document.getElementById(divId).innerHTML;
    // var printWindow = window.open('', '', 'height=400,width=500');
    // printWindow.document.write('<html><head><title>Payment</title>');
    // printWindow.document.write('<link rel="stylesheet" type="text/css" href="cofe.css">');
    // printWindow.document.write('</head><body>');
    // printWindow.document.write(divContent);
    // printWindow.document.write('</body></html>');
    // printWindow.document.close();
    // printWindow.onload = function() {
    //     printWindow.print();
    //     printWindow.close();
    // };
    alert('Payment successful!');
}