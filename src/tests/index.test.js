import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import V, { createValidator } from '@/core/index'

describe('index.ts — полный тест класса V и createValidator', () => {
  let container
  let form

  const setup = () => {
    container = document.createElement('div')
    form = document.createElement('form')
    container.appendChild(form)
    document.body.appendChild(container)
  }

  const teardown = () => {
    if (container?.parentNode) {
      document.body.removeChild(container)
    }
  }

  beforeEach(setup)
  afterEach(teardown)

  const input = (attrs = {}) => {
    const el = document.createElement('input')
    Object.assign(el, attrs)
    if (attrs.name) el.name = attrs.name
    if (attrs.id) el.id = attrs.id
    form.appendChild(el)
    return el
  }

  const wrapper = (child, errorContainer = false) => {
    const div = document.createElement('div')
    div.appendChild(child)
    if (errorContainer) {
      const err = document.createElement('div')
      err.className = 'error-message'
      div.appendChild(err)
    }
    form.appendChild(div)
    return div
  }

  it('createValidator и V.form возвращают экземпляр V', () => {
    const v1 = createValidator(form)
    const v2 = V.form(form)

    expect(v1).toBeDefined()
    expect(v2).toBeDefined()
    expect(typeof v1.field).toBe('function')
    expect(typeof v2.validate).toBe('function')
  })

  it('field() находит поле и кэширует валидатор', () => {
    input({ name: 'username' })
    const v = V.form(form)

    const validator1 = v.field('username')
    const validator2 = v.field('username')

    expect(validator1).toBeDefined()
    expect(validator1).toBe(validator2)
  })

  it('field() бросает ошибку, если поле не найдено', () => {
    const v = V.form(form)
    expect(() => v.field('unknown')).toThrow('Поле "unknown" не найдено в форме')
  })

  it('validate() возвращает { isValid, errors } и обновляет UI', () => {
    input({ name: 'name' })
    input({ name: 'email' })

    const v = V.form(form)
    v.field('name').required()
    v.field('email').email()

    let result = v.validate()
    expect(result.isValid).toBe(false)
    expect(result.errors.name).toBe('Поле обязательно для заполнения')
    expect(result.errors.email).toBe('Некорректный email')

    form.querySelector('[name="name"]').value = 'John'
    form.querySelector('[name="email"]').value = 'john@example.com'

    result = v.validate()
    expect(result.isValid).toBe(true)
    expect(result.errors.name).toBeNull()
    expect(result.errors.email).toBeNull()
  })

  it('validateField() валидирует одно поле и обновляет UI', () => {
    const el = input({ name: 'age' })
    const v = V.form(form)
    v.field('age').required('Возраст обязателен')

    let error = v.validateField('age')
    expect(error).toBe('Возраст обязателен')

    el.value = '25'
    error = v.validateField('age')
    expect(error).toBeNull()
  })

  it('validateField() бросает ошибку, если валидатор не создан', () => {
    const v = V.form(form)
    expect(() => v.validateField('unknown')).toThrow('Валидатор для поля "unknown" не найден')
  })

  it('showError / clearError — добавляет/удаляет классы и сообщения (по умолчанию)', () => {
    const fieldWrapper = wrapper(input({ name: 'email' }), true)
    const v = V.form(form)
    v.field('email').required()

    // Ошибка
    v.validate()
    const el = form.querySelector('[name="email"]')
    expect(el.classList.contains('error')).toBe(true)
    expect(el.classList.contains('valid')).toBe(false)
    const msg = fieldWrapper.querySelector('.error-message')
    expect(msg.textContent).toBe('Поле обязательно для заполнения')
    expect(msg.style.display).toBe('block')

    // Успех
    el.value = 'test@example.com'
    v.validate()
    expect(el.classList.contains('error')).toBe(false)
    expect(el.classList.contains('valid')).toBe(true)
    expect(msg.textContent).toBe('')
    expect(msg.style.display).toBe('none')
  })

  it('showError / clearError — с кастомными классами через options', () => {
    const el = input({ name: 'password' })
    const v = V.form(form, {
      errorClass: 'has-error',
      validClass: 'is-valid',
      invalidClass: 'is-invalid'
    })
    v.field('password').required()

    // Ошибка
    v.validate()
    expect(el.classList.contains('has-error')).toBe(true)
    expect(el.classList.contains('is-invalid')).toBe(true)
    expect(el.classList.contains('is-valid')).toBe(false)

    // Успех
    el.value = '123'
    v.validate()
    expect(el.classList.contains('has-error')).toBe(false)
    expect(el.classList.contains('is-invalid')).toBe(false)
    expect(el.classList.contains('is-valid')).toBe(true)
  })

  it('reset() очищает все ошибки', () => {
    const wrapper1 = wrapper(input({ name: 'name' }), true)
    const wrapper2 = wrapper(input({ name: 'email' }), true)

    const v = V.form(form)
    v.field('name').required()
    v.field('email').email()

    v.validate()

    const nameEl = form.querySelector('[name="name"]')
    const emailEl = form.querySelector('[name="email"]')
    expect(nameEl.classList.contains('error')).toBe(true)
    expect(emailEl.classList.contains('error')).toBe(true)

    v.reset()

    expect(nameEl.classList.contains('error')).toBe(false)
    expect(emailEl.classList.contains('error')).toBe(false)
    expect(nameEl.classList.contains('valid')).toBe(true)
    expect(emailEl.classList.contains('valid')).toBe(true)
    expect(wrapper1.querySelector('.error-message').textContent).toBe('')
    expect(wrapper2.querySelector('.error-message').textContent).toBe('')
  })

  it('getForm() возвращает исходную форму', () => {
    const v = V.form(form)
    expect(v.getForm()).toBe(form)
  })
})
