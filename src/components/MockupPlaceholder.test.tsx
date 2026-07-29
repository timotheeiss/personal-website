import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { MockupPlaceholder } from './MockupPlaceholder'

const images = [
  { src: '/projects/test/01.jpg', alt: 'First product view' },
  { src: '/projects/test/02.jpg', alt: 'Second product view' },
  { src: '/projects/test/03.jpg', alt: 'Third product view' },
]

describe('MockupPlaceholder carousel', () => {
  it('supports buttons, dots, and keyboard navigation', async () => {
    const user = userEvent.setup()
    render(<MockupPlaceholder project="Test project" images={images} />)

    const carousel = screen.getByRole('group', { name: 'Test project product gallery' })
    expect(screen.getByRole('img', { name: 'First product view' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Next Test project image' }))
    expect(screen.getByRole('img', { name: 'Second product view' })).toBeInTheDocument()
    fireEvent.transitionEnd(carousel.querySelector('.mockup-carousel__track') as Element)

    await user.click(screen.getByRole('button', { name: 'Show Test project image 3 of 3' }))
    expect(screen.getByRole('img', { name: 'Third product view' })).toBeInTheDocument()
    fireEvent.transitionEnd(carousel.querySelector('.mockup-carousel__track') as Element)

    fireEvent.keyDown(carousel, { key: 'ArrowLeft' })
    expect(screen.getByRole('img', { name: 'Second product view' })).toBeInTheDocument()
  })
})
