import { render, screen, fireEvent } from '@testing-library/react'
import CartRow from './CartRow'
import { vi, Mock } from 'vitest'
import { useCart } from '@/context/CartContext'

vi.mock('@/context/CartContext')

const mockItem = {
    product: {
        id: 1,
        name: 'Producto de Prueba',
        price: 1000,
        stock: 5,
        imageUrl: ''
    },
    quantity: 2

}

describe('CartRow', () => {

    test('debe llamar al updateQuantity con la cantidad aumentada al tocar +', () => {

        const update = vi.fn();
        const remove = vi.fn();

        (useCart as Mock).mockReturnValue({
            updateQuantity: update,
            removeFromCart: remove
        })

        render(<CartRow item={mockItem} />)

        const botones = screen.getAllByRole('button')

        fireEvent.click(botones[3])

        expect(update).toHaveBeenCalledWith(mockItem.product.id, 3)
    })

    test('El boton de suma se debe deshabilitar si se alcanza el stock maximo', () => {
        const itemEnLimite = {
            ...mockItem,
            quantity: 5
        };
        (useCart as Mock).mockReturnValue({
            updateQuantity: vi.fn(),
            removeFromCart: vi.fn()
        })



        render(<CartRow item={itemEnLimite} />)

        const botones = screen.getAllByRole('button')

        const botonSumar = botones[3]

        expect(botonSumar).toBeDisabled()
    })


    test('Al tocar eliminar, se debe llamar a removeFromCart', () => {


        const remove = vi.fn();

        (useCart as Mock).mockReturnValue({
            updateQuantity: vi.fn(),
            removeFromCart: remove
        })

        render(<CartRow item={mockItem} />)

        const botones = screen.getAllByRole('button')
        fireEvent.click(botones[0])

        expect(remove).toHaveBeenCalledWith(mockItem.product.id)
    })

})


