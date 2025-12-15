ValidPro — это TypeScript-библиотека для валидации HTML-форм, сочетающая возможности стандартной Constraint Validation API с гибким Fluent API в стиле Zod. Библиотека позволяет декларативно описывать правила валидации, автоматически обрабатывает связь с DOM и предоставляет расширенные возможности кастомизации.

Команда разработки:

Максимов Андрей (@stl2802)

Оганесян Максим (@MaksOganesyan)

🚀 Быстрый старт
Установка
bash
npm install validpro
или прямо в браузере:

html
<script type="module">
  import { form } from 'https://cdn.jsdelivr.net/npm/validpro@latest/dist/index.js';
</script>
пока не реализованно

Базовое использование
typescript
import { form } from 'validpro';

// Создание валидатора для формы
const validator = form(document.querySelector('form')!);

// Настройка правил валидации
validator
  .field('email')
  .required('Email обязателен')
  .email('Некорректный email');

validator
  .field('password')
  .required('Пароль обязателен')
  .min(6, 'Минимум 6 символов');

validator
  .field('age')
  .number('Возраст должен быть числом')
  .minNumber(18, 'Минимум 18 лет');

// Валидация всей формы
const result = validator.validate();
console.log(result.isValid); // boolean
console.log(result.errors);  // Record<string, string | null>

// Использование в обработчике submit
formElement.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const result = validator.validate();
  
  if (result.isValid) {
    // Отправка формы
    formElement.submit();
  }
});
Архитектура проекта
Структура файлов
text
index.html
package.json
package-lock.json
src/
├── core/
│   ├── fields.ts          # Класс Validator для работы с полями
│   ├── form-connector.ts  # Класс FormConnector для связи с DOM
│   ├── index.ts           # Основной класс V (публичный интерфейс)
│   └── validator.ts       # Основная логика валидации
├── types/
│   └── index.ts           # Типы TypeScript
├── index.ts               # Публичный API (ре-экспорт)
└── main.ts                # Точка входа и демо
Ключевые компоненты

1. V (Основной класс)
2. FormConnector
Отвечает за связь с DOM-элементами формы:

Автоматический поиск полей по атрибутам name, id, field-name

Сбор связанных <label> элементов

Поиск контейнеров для вывода ошибок

Поддержка кастомных CSS-селекторов

3. Validator
Реализует Fluent API для описания правил валидации:

Цепочка методов (required().email().min())

Автоматическое чтение атрибутов Constraint Validation API

Кастомные валидаторы

API Reference
Создание валидатора
typescript
import { form, V } from 'validpro';

// Вариант 1: через функцию form()
const validator = form(document.getElementById('myForm') as HTMLFormElement);

// Вариант 2: через статический метод
const validator = V.form(document.querySelector('form'));

// Вариант 3: с опциями
const validator = form(formElement, {
  errorContainer: '.error-message',
  errorClass: 'has-error',
  validClass: 'is-valid',
  invalidClass: 'is-invalid'
});
Опции конфигурации
typescript
type FieldOptions = {
  errorContainer?: string;    // Селектор для контейнера ошибок
  errorClass?: string;        // CSS-класс при ошибке
  validClass?: string;        // CSS-класс при успехе
  invalidClass?: string;      // CSS-класс при невалидности
  fieldClass?: string;        // CSS-класс для поля
  label?: string;            // Кастомная метка
};
Методы валидации
Базовые валидаторы
typescript
validator.field('username')
  .required('Обязательное поле')
  .string('Должно быть строкой')
  .min(3, 'Минимум 3 символа')
  .max(50, 'Максимум 50 символов');

validator.field('email')
  .email('Некорректный email')
  .required('Email обязателен');

validator.field('age')
  .number('Должно быть числом')
  .minNumber(18, 'Минимум 18 лет')
  .maxNumber(100, 'Максимум 100 лет');

validator.field('password')
  .required('Пароль обязателен')
  .min(8, 'Минимум 8 символов')
  .passwordStrong(8, 'Слабый пароль');
Специализированные валидаторы
typescript
// Телефоны
.field('phone').phone('ru', 'Введите российский номер')
.field('phone_us').phone('us', 'Введите US номер')
.field('phone_eu').phone('eu', 'Введите EU номер')

// Даты
.field('birth_date').date('ru', 'Введите дату в формате ДД.ММ.ГГГГ')
.field('us_date').date('us', 'Введите дату в формате ММ/ДД/ГГГГ')
.field('iso_date').date('iso', 'Введите дату в формате ГГГГ-ММ-ДД')

// URL
.field('website').url('Введите корректный URL')

// Почтовые индексы
.field('zip_ru').zipCode('ru', '6 цифр')
.field('zip_us').zipCode('us', '5 или 9 цифр')

// Кредитные карты
.field('card').creditCard('visa', 'Некорректный номер Visa')
.field('card_mc').creditCard('mastercard', 'Некорректный MasterCard')

// Российские идентификаторы
.field('inn').inn('Некорректный ИНН')
.field('snils').snils('Некорректный СНИЛС')

// IP адреса
.field('ip').ipAddress('v4', 'Введите IPv4 адрес')
.field('ipv6').ipAddress('v6', 'Введите IPv6 адрес')
Подтверждение пароля
typescript
validator.field('password')
  .required('Введите пароль')
  .min(8, 'Минимум 8 символов');

validator.field('confirm_password')
  .required('Подтвердите пароль')
  .confirm('password', 'Пароли не совпадают');
Массивы и чекбоксы
typescript
validator.field('interests')
  .array('Выберите хотя бы один интерес')
  .minLength(1, 'Выберите минимум 1 пункт')
  .maxLength(5, 'Максимум 5 пунктов');

validator.field('files')
  .array('Загрузите файлы')
  .minLength(1, 'Загрузите хотя бы 1 файл')
  .maxLength(10, 'Максимум 10 файлов');
Кастомные валидаторы
typescript
validator.field('custom')
  .custom((value: string) => {
    return value.includes('@') || 'Должен содержать @';
  }, 'Кастомная ошибка');

// Или с возвратом boolean
.field('even').custom((val) => parseInt(val) % 2 === 0, 'Должно быть четным')
Регулярные выражения
typescript
validator.field('license_plate')
  .pattern(/^[АВЕКМНОРСТУХ]\d{3}(?<!000)[АВЕКМНОРСТУХ]{2}\d{2,3}$/, 'Некорректный номер авто');
Валидация
typescript
// Валидация всего формы
const result = validator.validate();
// { isValid: boolean, errors: Record<string, string | null> }

// Валидация конкретного поля
const error = validator.validateField('email');
// string | null (null если валидно)

// Сброс всех ошибок
validator.reset();
Интеграция с Constraint Validation API
Библиотека автоматически читает стандартные HTML-атрибуты:

html
<input 
  type="email" 
  name="email" 
  required 
  minlength="5" 
  maxlength="100" 
  pattern=".+@.+\..+">
Эквивалентно:

typescript
validator.field('email')
  .required()
  .min(5)
  .max(100)
  .email();
Особенности и возможности
Автоматическое обнаружение полей
Библиотека ищет поля в следующем порядке:

По атрибуту field-name (кастомный)

По атрибуту name

По атрибуту id

html
<!-- Все варианты работают -->
<input type="text" field-name="username">
<input type="email" name="email">
<input type="password" id="password">
Управление ошибками
По умолчанию:

При ошибке добавляется CSS-класс error

Создается элемент с классом error-message

При успехе добавляется класс valid

Кастомизация:

typescript
const validator = form(formElement, {
  errorClass: 'is-invalid',
  validClass: 'is-valid',
  invalidClass: 'has-danger',
  errorContainer: '.alert' // Селектор для кастомного контейнера
});
Поддержка различных типов полей
Текстовые поля (text, email, password, tel, url)

Числовые поля (number, range)

Выбор файлов (file)

Чекбоксы и радио-кнопки

Выпадающие списки (select)

Многострочный текст (textarea)

Примеры использования
Полный пример формы
HTML:

html
<form id="registration-form" novalidate>
  <div class="form-group">
    <label for="email">Email</label>
    <input type="email" id="email" name="email" required>
    <div class="error-message"></div>
  </div>
  
  <div class="form-group">
    <label for="password">Пароль</label>
    <input type="password" id="password" name="password" minlength="8">
    <div class="error-message"></div>
  </div>
  
  <div class="form-group">
    <label for="confirm_password">Подтверждение пароля</label>
    <input type="password" id="confirm_password" name="confirm_password">
    <div class="error-message"></div>
  </div>
  
  <div class="form-group">
    <label for="age">Возраст</label>
    <input type="number" id="age" name="age" min="18" max="100">
    <div class="error-message"></div>
  </div>
  
  <button type="submit">Зарегистрироваться</button>
</form>
JavaScript

import { form } from 'validpro';

const registrationForm = document.getElementById('registration-form') as HTMLFormElement;
const validator = form(registrationForm);

// Настройка правил
validator
  .field('email')
  .required('Email обязателен')
  .email('Некорректный формат email');

validator
  .field('password')
  .required('Пароль обязателен')
  .min(8, 'Минимум 8 символов')
  .passwordStrong(8, 'Пароль должен содержать заглавные, строчные буквы, цифры и спецсимволы');

validator
  .field('confirm_password')
  .required('Подтвердите пароль')
  .confirm('password', 'Пароли не совпадают');

validator
  .field('age')
  .number('Возраст должен быть числом')
  .minNumber(18, 'Минимум 18 лет')
  .maxNumber(100, 'Максимум 100 лет');

// Обработка submit
registrationForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const result = validator.validate();
  
  if (result.isValid) {
    // Сбор данных формы
    const formData = new FormData(registrationForm);
    
    try {
      // Отправка на сервер
      const response = await fetch('/api/register', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        alert('Регистрация успешна!');
        validator.reset();
        registrationForm.reset();
      }
    } catch (error) {
      console.error('Ошибка отправки:', error);
    }
  } else {
    console.log('Ошибки валидации:', result.errors);
  }
});

// Валидация при потере фокуса
registrationForm.addEventListener('blur', (e) => {
  const target = e.target as HTMLElement;
  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
    const fieldName = target.getAttribute('name') || target.getAttribute('id');
    if (fieldName) {
      validator.validateField(fieldName);
    }
  }
}, true);
Использование с data-атрибутами
HTML:

html
<input 
  type="text" 
  name="username"
  data-validate="required,min:3,max:50"
  data-error-required="Имя обязательно"
  data-error-min="Минимум 3 символа">
JavaScript:

JavaScript
import { initDemo } from 'validpro';

// Автоматическая инициализация
document.addEventListener('DOMContentLoaded', () => {
  initDemo();
});
React-компонент (пример)
tsx
import React, { useRef, useEffect } from 'react';
import { form } from 'validpro';

const ValidatedForm: React.FC = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const validatorRef = useRef<any>(null);

  useEffect(() => {
    if (formRef.current) {
      validatorRef.current = form(formRef.current);
      
      validatorRef.current
        .field('email')
        .required('Email required')
        .email('Invalid email');
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validatorRef.current) {
      const result = validatorRef.current.validate();
      
      if (result.isValid) {
        // Submit logic
      }
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <input name="email" type="email" />
      <button type="submit">Submit</button>
    </form>
  );
};
Расширенные возможности
Доступ к ValidityState
typescript
const validator = validator.field('email');
const validity = validator.getValidity();

console.log(validity?.valid);      // boolean
console.log(validity?.valueMissing); // boolean
console.log(validity?.typeMismatch); // boolean
Глобальные утилиты
typescript
import { utils, constants } from 'validpro';

// Вспомогательные функции
utils.isValidEmail('test@example.com'); // true
utils.isNumber('123'); // true
utils.isEmpty(''); // true
utils.isEmpty([]); // true
utils.isEmpty({}); // true

// Константы
constants.VALIDATION_TYPES.REQUIRED; // 'required'
constants.DEFAULT_MESSAGES.REQUIRED; // 'Поле обязательно для заполнения'
constants.CSS_CLASSES.ERROR; // 'error'
Кастомные сообщения об ошибках
typescript
// Глобальная настройка
const validator = form(formElement, {
  messages: {
    required: 'Это поле обязательно',
    email: 'Введите корректный email',
    // ...
  }
});

// Локальная настройка
validator
  .field('email')
  .required('Пожалуйста, введите email')
  .email('Проверьте формат email адреса');
Разработка
Установка для разработки
bash
git clone <repository-url>
cd validpro
npm install
npm run dev
Сборка
bash
npm run build        # Production сборка
npm run build:dev    # Development сборка
npm run type-check   # Проверка типов TypeScript
npm run test # для запуска тестов
Структура типов
typescript
// Основные типы
type ValidationRule = {
  type: string;
  value?: string | number | boolean | RegExp | ((value: string) => boolean | string);
  error: string;
};

type ValidatorConfig = {
  rules: ValidationRule[];
  fieldName: string;
  element: HTMLElement;
};

type ValidationResult = {
  isValid: boolean;
  errors: Record<string, string | null>;
};

type FieldOptions = {
  errorContainer?: string;
  errorClass?: string;
  validClass?: string;
  invalidClass?: string;
  fieldClass?: string;
  label?: string;
};
Лучшие практики
Всегда используйте novalidate на форме для отключения нативной валидации

Предоставляйте понятные сообщения об ошибках на языке пользователя

Валидируйте на blur для быстрой обратной связи

Не забывайте валидировать на сервере — клиентская валидация для UX

Используйте Constraint Validation API где возможно для совместимости

Тестируйте с разными типами полей (файлы, массивы, числа)

Совместимость
JS: 4.0+

Браузеры: Chrome 60+, Firefox 55+, Safari 10.1+, Edge 79+

Node.js: 14+ (для SSR)

Фреймворки: React, Vue, Angular, Svelte (через адаптеры)

Лицензия
MIT License

🔗 Ссылки
GitHub Repository - https://github.com/FrontendCourseMP/ts-lib-oganesyan-maksimov



Поддержка
При возникновении вопросов или предложений:

Создайте issue на GitHub

Напишите на email: (не пишите сюда)

Присоединяйтесь к Discord-сообществу - 

Документация обновлена: декабрь 2025
Версия библиотеки: 1.0.0