import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { MockupPlaceholder } from './MockupPlaceholder'

const images = [
  { src: '/projects/test/01.jpg', alt: 'First product view' },
  { src: '/projects/test/02.jpg', alt: 'Second product view' },
  { src: '/projects/test/03.jpg', alt: 'Third product view' },
]

const imageVariants = {
  mobile: {
    dark: images,
    light: images.map((image) => ({ ...image, src: image.src.replace('.jpg', '-light.jpg') })),
  },
  web: {
    dark: images.map((image) => ({ ...image, src: image.src.replace('/test/', '/test/web/') })),
    light: images.map((image) => ({
      ...image,
      src: image.src.replace('/test/', '/test/web/').replace('.jpg', '-light.jpg'),
    })),
  },
}

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

  it('defaults to mobile dark and switches platform and appearance without changing slides', async () => {
    const user = userEvent.setup()
    render(<MockupPlaceholder project="Test project" imageVariants={imageVariants} />)

    expect(screen.getByRole('button', { name: 'Show Test project mobile images' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Show Test project in dark mode' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('img', { name: 'First product view' })).toHaveAttribute('src', '/projects/test/01.jpg')

    await user.click(screen.getByRole('button', { name: 'Show Test project image 2 of 3' }))
    fireEvent.transitionEnd(document.querySelector('.mockup-carousel__track') as Element)
    await user.click(screen.getByRole('button', { name: 'Show Test project in light mode' }))

    expect(document.querySelector('.mockup-carousel__outgoing')).toHaveAttribute('src', '/projects/test/02.jpg')
    fireEvent.animationEnd(document.querySelector('.mockup-carousel__track') as Element)
    await waitFor(() => {
      expect(document.querySelector('.mockup-carousel__outgoing')).not.toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Show Test project web images' }))

    expect(screen.getByRole('img', { name: 'Second product view' })).toHaveAttribute(
      'src',
      '/projects/test/web/02-light.jpg',
    )
  })

  it('opens the active image in a lightbox and supports navigation and dismissal', async () => {
    const user = userEvent.setup()
    render(<MockupPlaceholder project="Test project" images={images} />)

    await user.click(screen.getByRole('button', { name: 'Expand Test project image 1' }))

    const lightbox = screen.getByRole('dialog', { name: 'Test project image viewer' })
    expect(lightbox).toBeInTheDocument()
    expect(within(lightbox).getByRole('img', { name: 'First product view' })).toBeInTheDocument()
    expect(document.body).toHaveStyle({ overflow: 'hidden' })

    await user.click(screen.getByRole('button', { name: 'Next Test project image in expanded view' }))
    expect(within(lightbox).getByRole('img', { name: 'Second product view' })).toBeInTheDocument()

    fireEvent.keyDown(lightbox, { key: 'Escape' })
    expect(screen.queryByRole('dialog', { name: 'Test project image viewer' })).not.toBeInTheDocument()
  })
})
