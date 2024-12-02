export const CartReducer = (state, action) => {
    switch (action.type) {
        case 'ADD_TO_CART': {
            const product = action.payload;
            const existingProduct = state.shoppingCart.find(item => item.id === product.id);
            console.log(product); 
            console.log(existingProduct);

            if (existingProduct) {
                // Update the quantity
                return {
                    ...state,
                    shoppingCart: state.shoppingCart.map(item =>
                        item.id === product.id
                            ? { ...item, quantity: item.quantity + 1 }
                            : item
                    ),
                    totalPrice: state.totalPrice + product.price,
                    totalQty: state.totalQty + 1,
                };
            } else {
                // Add a new product
                return {
                    ...state,
                    shoppingCart: [...state.shoppingCart, { ...product, quantity: 1 }],
                    totalPrice: state.totalPrice + product.price,
                    totalQty: state.totalQty + 1,
                };
            }
        }
        default:
            return state;
    }
};
