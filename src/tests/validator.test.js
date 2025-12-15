import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { Validator } from '@/core/validator'

describe('Validator — полный, подробный и изолированный тест с jsdom', () => {
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
    form.appendChild(el)
    return el
  }

  const textarea = (attrs = {}) => {
    const el = document.createElement('textarea')
    Object.assign(el, attrs)
    form.appendChild(el)
    return el
  }

  const select = (attrs = {}, options = []) => {
    const el = document.createElement('select')
    Object.assign(el, attrs)
    options.forEach(([value, text, selected]) => {
      const opt = document.createElement('option')
      opt.value = value
      opt.textContent = text
      if (selected) opt.selected = true
      el.appendChild(opt)
    })
    form.appendChild(el)
    return el
  }

  const v = (element, name = 'test') => new Validator(element, form, name)

  describe('getValue()', () => {
    it('text/password/etc → возвращает value', () => {
      const el = input({ type: 'text', value: 'hello' })
      expect(v(el).value).toBe('hello')
    })

    it('checkbox → возвращает checked', () => {
      const el = input({ type: 'checkbox', checked: true })
      expect(v(el).value).toBe(true)
      el.checked = false
      expect(v(el).getValue()).toBe(false)
    })

    it('radio → возвращает value выбранной кнопки в группе', () => {
      input({ type: 'radio', name: 'color', value: 'red' })
      input({ type: 'radio', name: 'color', value: 'blue', checked: true })
      const validator = v(form.querySelector('[value="red"]'))
      expect(validator.value).toBe('blue')
    })

    it('radio → null, если ничего не выбрано', () => {
      const el = input({ type: 'radio', name: 'choice' })
      expect(v(el).value).toBe(null)
    })

    it('number/range → valueAsNumber', () => {
      const el = input({ type: 'number', value: '42' })
      expect(v(el).value).toBe(42)
      el.value = ''
      expect(v(el).getValue()).toBe(NaN)
    })

    it('textarea → value', () => {
      const el = textarea({ value: 'текст' })
      expect(v(el).value).toBe('текст')
    })

    it('select → выбранное value', () => {
      const el = select({ name: 'country' }, [
        ['ru', 'Россия', false],
        ['us', 'USA', true],
      ])
      expect(v(el).value).toBe('us')
    })

  })

  describe('loadConstraintValidation()', () => {
    it('required → добавляет правило', () => {
      const el = input({ required: true })
      Object.defineProperty(el, 'validationMessage', { value: 'Обязательно!', writable: true })
      const validator = v(el)
      expect(validator.config.rules).toContainEqual({
        type: 'required',
        error: 'Обязательно!'
      })
    })

    it('minLength / maxLength', () => {
      const el = input({ type: 'text', minLength: 3, maxLength: 20 })
      const validator = v(el)
      const rules = validator.config.rules
      expect(rules).toContainEqual({ type: 'min', value: 3, error: expect.any(String) })
      expect(rules).toContainEqual({ type: 'max', value: 20, error: expect.any(String) })
    })

    it('pattern → создаёт RegExp', () => {
      const el = input({ type: 'text', pattern: '\\d{4}' })
      const validator = v(el)
      const rule = validator.config.rules.find(r => r.type === 'pattern')
      expect(rule.value).toBeInstanceOf(RegExp)
      expect(rule.value.test('1234')).toBe(true)
    })

    it('type="email" → добавляет email-правило', () => {
      const el = input({ type: 'email' })
      const validator = v(el)
      expect(validator.config.rules).toContainEqual({
        type: 'email',
        error: 'Некорректный email'
      })
    })

    it('min/max для number → minNumber/maxNumber', () => {
      const el = input({ type: 'number', min: '10', max: '100' })
      const validator = v(el)
      const rules = validator.config.rules
      expect(rules).toContainEqual({ type: 'minNumber', value: 10, error: expect.any(String) })
      expect(rules).toContainEqual({ type: 'maxNumber', value: 100, error: expect.any(String) })
    })
  })

   describe('методы валидатора', () => {
    it('.required()', () => {
      const el = input()
      const validator = v(el).required('Заполните')
      expect(validator.validate()).toBe('Заполните')
      el.value = 'ok'
      expect(validator.validate()).toBeNull()
    })

    it('.email()', () => {
      const el = input()
      const validator = v(el).email('Плохой email')
      el.value = 'bad'
      expect(validator.validate()).toBe('Плохой email')
      el.value = 'good@example.com'
      expect(validator.validate()).toBeNull()
    })

    it('.min() / .max()', () => {
      const el = input()
      const validator = v(el).min(3).max(10)

      el.value = 'ab'
      expect(validator.validate()).toBe('Минимальная длина не достигнута')
      el.value = 'abcdefghijk'
      expect(validator.validate()).toBe('Максимальная длина превышена')
      el.value = 'good'
      expect(validator.validate()).toBeNull()
    })

    it('.phone() — поддерживает ru, us, eu, any', () => {
      const el = input()

      let validator = v(el).phone('ru')
      el.value = '+79123456789'
      expect(validator.validate()).toBeNull()

      validator = v(el).phone('us')
      el.value = '2125551212'
      expect(validator.validate()).toBeNull()

      validator = v(el).phone('any')
      el.value = '+12345678901'
      expect(validator.validate()).toBeNull()
    })

    it('.confirm()', () => {
      input({ name: 'pass', value: '123' })
      const confirm = input({ name: 'confirm' })

      const validator = v(confirm).confirm('pass')
      confirm.value = '456'
      expect(validator.validate()).toBe('Пароли не совпадают')
      confirm.value = '123'
      expect(validator.validate()).toBeNull()
    })

    it('.custom()', () => {
      const el = input()
      const validator = v(el).custom(val => val > 10 || 'Мало')
      el.value = '5'
      expect(validator.validate()).toBe('Мало')
      el.value = '15'
      expect(validator.validate()).toBeNull()
    })

    it('.passwordStrong()', () => {
      const el = input()
      const validator = v(el).passwordStrong(8)
      el.value = 'weak'
      expect(validator.validate()).toMatch(/Пароль должен содержать/)
      el.value = 'Ab1!cdEF'
      expect(validator.validate()).toBeNull()
    })


  })

  it('validate() возвращает validationMessage при invalid', () => {
    const el = input({ type: 'email', required: true })
    el.value = 'не email'

    const validator = v(el)
    const error = validator.validate()
    expect(typeof error).toBe('string')
    expect(error.length).toBeGreaterThan(0)
  })

   describe('геттеры', () => {
    it('getFieldName()', () => {
      const el = input()
      expect(v(el, 'username').getFieldName()).toBe('username')
    })

    it('getElement()', () => {
      const el = input()
      expect(v(el).getElement()).toBe(el)
    })

    it('getValidity() — для input/textarea/select', () => {
      const el = input({ required: true })
      const validity = v(el).getValidity()
      expect(validity).toBeDefined()
      expect(validity.valid).toBe(false)
    })

    it('getValidity() — null для других элементов', () => {
      const el = document.createElement('div')
      expect(v(el).getValidity()).toBeNull()
    })
  })
})
