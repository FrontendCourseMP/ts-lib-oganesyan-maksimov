import { describe, expect, test, beforeEach } from 'vitest'
import { createValidator } from '../core/fields';
import { JSDOM } from 'jsdom';

describe('Validator - разные DOM структуры', () => {
  describe('DOM 1: Базовый вариант с label и error-сообщениями', () => {
    let dom;
    let document;

    beforeEach(() => {
      dom = new JSDOM(`
        <!DOCTYPE html>
        <html>
          <body>
            <form id="signup-form" class="form">
              <div class="form-group">
                <label for="name">Имя</label>
                <input type="text" id="name" name="name" field-name="name">
                <div class="error-container"></div>
              </div>
              
              <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" name="email">
                <span class="error-placeholder"></span>
              </div>
              
              <div class="form-group">
                <label>Пароль
                  <input type="password" name="password">
                </label>
                <div data-error-for="password"></div>
              </div>
              
              <button type="submit">Зарегистрироваться</button>
            </form>
          </body>
        </html>
      `);
      document = dom.window.document;

    });

    test('должен находить поля с разными способами связи с label', () => {
      const form = document.getElementById('signup-form');
      const validator = createValidator(form);
      
      validator.field('name').required();

      validator.field('email').email().required();
      
      validator.field('password').required().min(6);
      
      const nameInput = document.querySelector('[name="name"]');
      nameInput.value = '';
      
      const result = validator.validate();
      
      expect(result.errors.name).toBe('Поле обязательно для заполнения');
      expect(result.errors.email).toBe('Поле обязательно для заполнения');
      expect(result.errors.password).toBe('Поле обязательно для заполнения');
    });

    test('должен показывать ошибки в разных контейнерах', () => {
      const form = document.getElementById('signup-form');
      const validator = createValidator(form);
      
      validator.field('name').required('Введите имя');
      validator.field('email').email();
      
      const nameInput = document.querySelector('[name="name"]');
      const emailInput = document.querySelector('[name="email"]');
      
      nameInput.value = '';
      emailInput.value = 'invalid-email';
      
      validator.validate();
      
      expect(nameInput.classList.contains('error')).toBe(true);
      expect(emailInput.classList.contains('error')).toBe(true);
      
      const nameError = nameInput.parentElement?.querySelector('.error-message');
      const emailError = emailInput.parentElement?.querySelector('.error-message');
      
      expect(nameError?.textContent).toBe('Введите имя');
      expect(emailError?.textContent).toBe('Некорректный email');
    });
  });

  describe('DOM 2: Форма с кастомными атрибутами и вложенными полями', () => {
    let dom;
    let document;

    beforeEach(() => {
      dom = new JSDOM(`
        <!DOCTYPE html>
        <html>
          <body>
            <form id="profile-form" data-validate="true">
              <fieldset>
                <legend>Персональные данные</legend>
                
                <div class="input-wrapper">
                  <input type="text" 
                         data-field="firstName" 
                         data-required="true" 
                         placeholder="Имя">
                  <small class="hint">Минимум 2 символа</small>
                </div>
                
                <div class="input-wrapper">
                  <input type="text" 
                         name="lastName" 
                         field-name="lastName" 
                         placeholder="Фамилия">
                  <div class="errors"></div>
                </div>
              </fieldset>
              
              <div class="section">
                <h3>Контакты</h3>
                <input type="tel" field-name="phone" data-validate-phone="true">
                <input type="url" name="website">
              </div>
              
              <div class="nested">
                <div class="deep-nested">
                  <select name="country" field-name="country">
                    <option value="">Выберите страну</option>
                    <option value="ru">Россия</option>
                    <option value="us">США</option>
                  </select>
                </div>
              </div>
            </form>
          </body>
        </html>
      `);
      document = dom.window.document;
    });

    test('должен находить поля с кастомными атрибутами', () => {
      const form = document.getElementById('profile-form');
      const validator = createValidator(form);
      
      const firstNameInput = document.querySelector('[data-field="firstName"]');
      firstNameInput.value = 'И';
      
      validator.field('firstName').required().min(2, 'Имя слишком короткое');
      
      validator.field('lastName').required();
      
      validator.field('phone').required();
      
      validator.field('website');
      
      validator.field('country').required('Выберите страну');
      
      const result = validator.validate();
      
      expect(result.errors.firstName).toBe('Имя слишком короткое');
      expect(result.errors.lastName).toBe('Поле обязательно для заполнения');
      expect(result.errors.phone).toBe('Поле обязательно для заполнения');
      expect(result.errors.country).toBe('Выберите страну');
    });

    test('должен работать с select элементами', () => {
      const form = document.getElementById('profile-form');
      const validator = createValidator(form);
      
      const countrySelect = document.querySelector('[name="country"]');
      countrySelect.value = '';
      
      validator.field('country').required();
      
      const result = validator.validate();
      expect(result.errors.country).toBe('Поле обязательно для заполнения');
      
      countrySelect.value = 'ru';
      const result2 = validator.validate();
      expect(result2.errors.country).toBeNull();
    });
  });

  describe('DOM 3: Форма с динамическими полями и массивами', () => {
    let dom;
    let document;

    beforeEach(() => {
      dom = new JSDOM(`
        <!DOCTYPE html>
        <html>
          <body>
            <form id="dynamic-form">
              <!-- Массив тегов -->
              <div class="tags-container" field-name="tags">
                <input type="text" class="tag-input" value="js">
                <input type="text" class="tag-input" value="ts">
                <input type="text" class="tag-input" value="react">
              </div>
              
              <!-- Динамическое поле с JSON -->
              <script type="application/json" id="skills-data">
                ["JavaScript", "TypeScript", "React"]
              </script>
              <div field-name="skills" data-source="#skills-data"></div>
              
              <!-- Группа чекбоксов -->
              <div class="checkbox-group" field-name="interests">
                <label>
                  <input type="checkbox" name="interests[]" value="sports"> Спорт
                </label>
                <label>
                  <input type="checkbox" name="interests[]" value="music"> Музыка
                </label>
                <label>
                  <input type="checkbox" name="interests[]" value="books"> Книги
                </label>
              </div>
              
              <!-- Множественный select -->
              <select name="languages" field-name="languages" multiple>
                <option value="ru">Русский</option>
                <option value="en">Английский</option>
                <option value="de">Немецкий</option>
              </select>
              
              <!-- Скрытое поле -->
              <input type="hidden" name="token" field-name="token" value="">
            </form>
            
            <script>
              // Симуляция динамического добавления данных
              const tagsContainer = document.querySelector('.tags-container');
              tagsContainer.setAttribute('data-tags', '["js","ts","react"]');
            </script>
          </body>
        </html>
      `);
      document = dom.window.document;
      
      const tagsContainer = document.querySelector('.tags-container');
      tagsContainer.textContent = JSON.stringify(['js', 'ts', 'react']);
      
      const skillsData = document.getElementById('skills-data');
      const skillsDiv = document.querySelector('[field-name="skills"]');
      skillsDiv.textContent = skillsData.textContent || '[]';
    });

    test('должен обрабатывать массивы из текстового контента', () => {
      const form = document.getElementById('dynamic-form');
      const validator = createValidator(form);
      
      validator.field('tags')
        .array()
        .minLength(2, 'Добавьте минимум 2 тега')
        .maxLength(5, 'Не более 5 тегов');
      
      validator.field('skills')
        .array()
        .minLength(1, 'Укажите хотя бы один навык');
      
      const result = validator.validate();
      
      expect(result.errors.tags).toBeNull(); 
      expect(result.errors.skills).toBeNull();
    });

    test('должен обрабатывать пустые массивы', () => {
      const form = document.getElementById('dynamic-form');
      const validator = createValidator(form);
      
      const tagsDiv = document.querySelector('[field-name="tags"]');
      tagsDiv.textContent = '[]';
      
      validator.field('tags')
        .array()
        .minLength(1, 'Добавьте хотя бы один тег');
      
      const result = validator.validate();
      
      expect(result.errors.tags).toBe('Добавьте хотя бы один тег');
    });

    test('должен работать со скрытыми полями', () => {
      const form = document.getElementById('dynamic-form');
      const validator = createValidator(form);
      
      const tokenInput = document.querySelector('[name="token"]');
      tokenInput.value = '';
      
      validator.field('token').required('Токен обязателен');
      
      const result = validator.validate();
      expect(result.errors.token).toBe('Токен обязателен');
      
      tokenInput.value = 'abc123';
      const result2 = validator.validate();
      expect(result2.errors.token).toBeNull();
    });
  });

  describe('DOM 4: Несколько форм на странице', () => {
    let dom;
    let document;

    beforeEach(() => {
      dom = new JSDOM(`
        <!DOCTYPE html>
        <html>
          <body>
            <!-- Форма 1: Логин -->
            <form id="login-form" class="auth-form">
              <h2>Вход</h2>
              <div>
                <input type="text" name="login-username" placeholder="Логин">
                <div class="error-box"></div>
              </div>
              <div>
                <input type="password" name="login-password" placeholder="Пароль">
              </div>
              <button>Войти</button>
            </form>
            
            <!-- Форма 2: Регистрация -->
            <form id="register-form" class="auth-form">
              <h2>Регистрация</h2>
              <div>
                <input type="text" field-name="reg-username" placeholder="Логин">
              </div>
              <div>
                <input type="email" name="reg-email" placeholder="Email">
              </div>
              <div>
                <input type="password" name="reg-password" placeholder="Пароль">
              </div>
              <div>
                <input type="password" name="reg-confirm" placeholder="Подтверждение">
              </div>
              <button>Зарегистрироваться</button>
            </form>
            
            <!-- Форма 3: Поиск -->
            <form id="search-form" role="search">
              <input type="search" name="query" field-name="search-query">
              <button type="submit">Найти</button>
            </form>
            
            <!-- Форма 4: Без id -->
            <form class="comment-form">
              <textarea name="comment-text" field-name="comment"></textarea>
              <button>Отправить</button>
            </form>
          </body>
        </html>
      `);
      document = dom.window.document;
    });

    test('должен работать с каждой формой независимо', () => {
      const loginForm = document.getElementById('login-form');
      const loginValidator = createValidator(loginForm);
      
      loginValidator.field('login-username').required('Введите логин');
      loginValidator.field('login-password').required('Введите пароль');

      const registerForm = document.getElementById('register-form');
      const registerValidator = createValidator(registerForm);
      
      registerValidator.field('reg-username').required().min(3);
      registerValidator.field('reg-email').email().required();
      registerValidator.field('reg-password').required().min(6);
      registerValidator.field('reg-confirm').confirm('reg-password', 'Пароли должны совпадать');
      
      const searchForm = document.getElementById('search-form');
      const searchValidator = createValidator(searchForm);
      
      searchValidator.field('search-query').required('Введите запрос');
      
      const commentForm = document.querySelector('.comment-form');
      const commentValidator = createValidator(commentForm);
      
      commentValidator.field('comment').required('Напишите комментарий');
      
      const loginUsername = document.querySelector('[name="login-username"]');
      const regUsername = document.querySelector('[field-name="reg-username"]');
      const regPassword = document.querySelector('[name="reg-password"]');
      const regConfirm = document.querySelector('[name="reg-confirm"]');
      const searchQuery = document.querySelector('[name="query"]');
      const commentText = document.querySelector('[name="comment-text"]');
      
      loginUsername.value = '';
      regUsername.value = 'ab';
      regPassword.value = '123456';
      regConfirm.value = '12345';
      searchQuery.value = '';
      commentText.value = '';
      
      const loginResult = loginValidator.validate();
      const registerResult = registerValidator.validate();
      const searchResult = searchValidator.validate();
      const commentResult = commentValidator.validate();
      
      expect(loginResult.errors['login-username']).toBe('Введите логин');
      expect(loginResult.errors['login-password']).toBe('Поле обязательно для заполнения');
      
      expect(registerResult.errors['reg-username']).toBe('Минимальная длина не достигнута');
      expect(registerResult.errors['reg-confirm']).toBe('Пароли должны совпадать');
      
      expect(searchResult.errors['search-query']).toBe('Введите запрос');
      expect(commentResult.errors.comment).toBe('Напишите комментарий');
    });

    test('должен корректно работать с confirm в пределах своей формы', () => {
      const registerForm = document.getElementById('register-form');
      const registerValidator = createValidator(registerForm);
      
      const regPassword = document.querySelector('[name="reg-password"]');
      const regConfirm = document.querySelector('[name="reg-confirm"]');
      
      regPassword.value = 'password123';
      regConfirm.value = 'password123';
      
      registerValidator.field('reg-confirm').confirm('reg-password');
      
      const result = registerValidator.validate();
      expect(result.errors['reg-confirm']).toBeNull();
    });
  });

  describe('DOM 5: Комплексная форма с таблицами и сложной структурой', () => {
    let dom;
    let document;

    beforeEach(() => {
      dom = new JSDOM(`
        <!DOCTYPE html>
        <html>
          <body>
            <form id="complex-form" data-validator="v2">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Поле</th>
                    <th>Значение</th>
                    <th>Ошибка</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><label for="product-name">Название</label></td>
                    <td>
                      <input type="text" 
                             id="product-name" 
                             name="productName" 
                             field-name="productName"
                             data-validate="required min:3">
                    </td>
                    <td class="error-cell"></td>
                  </tr>
                  <tr>
                    <td><label>Цена</label></td>
                    <td>
                      <div class="input-group">
                        <input type="number" 
                               name="price" 
                               field-name="price"
                               step="0.01"
                               aria-describedby="price-help">
                        <span class="input-group-text">$</span>
                      </div>
                      <small id="price-help">Минимум 0.01</small>
                    </td>
                    <td class="error-cell"></td>
                  </tr>
                </tbody>
              </table>
              
              <div class="row">
                <div class="col-6">
                  <div class="card">
                    <div class="card-header">Основное</div>
                    <div class="card-body">
                      <input type="url" 
                             name="productUrl" 
                             field-name="productUrl"
                             class="form-control">
                      <div class="invalid-feedback"></div>
                    </div>
                  </div>
                </div>
                
                <div class="col-6">
                  <div class="card">
                    <div class="card-header">Дополнительно</div>
                    <div class="card-body">
                      <div class="form-check">
                        <input type="checkbox" 
                               name="inStock" 
                               field-name="inStock"
                               class="form-check-input"
                               id="inStock">
                        <label class="form-check-label" for="inStock">
                          В наличии
                        </label>
                      </div>
                      
                      <div class="mt-3">
                        <label class="form-label">Категории</label>
                        <div field-name="categories" data-type="array">
                          ["electronics", "computers"]
                        </div>
                        <div class="form-text">Укажите в JSON формате</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="actions">
                <button type="submit" class="btn btn-primary">Сохранить</button>
                <button type="reset" class="btn btn-secondary">Сбросить</button>
              </div>
            </form>
            
            <!-- Внешние элементы, которые НЕ должны находиться -->
            <div class="external">
              <input type="text" name="externalField" value="внешнее поле">
            </div>
          </body>
        </html>
      `);
      document = dom.window.document;
      
      const categoriesDiv = document.querySelector('[field-name="categories"]');
      categoriesDiv.textContent = JSON.stringify(["electronics", "computers"]);
    });

    test('должен находить поля в сложной табличной структуре', () => {
      const form = document.getElementById('complex-form');
      const validator = createValidator(form);
      
      validator.field('productName')
        .required('Укажите название товара')
        .min(3, 'Название слишком короткое');
      
      validator.field('price')
        .number()
        .required('Укажите цену')
        .minNumber(0.01, 'Цена должна быть положительной');
      
      validator.field('productUrl')
        .required('Укажите URL товара');
      
      const inStockCheckbox = document.querySelector('[name="inStock"]');
      inStockCheckbox.checked = false;
      
      validator.field('categories')
        .array()
        .required('Укажите категории')
        .minLength(1, 'Выберите хотя бы одну категорию');
      
      const productNameInput = document.querySelector('[name="productName"]');
      const priceInput = document.querySelector('[name="price"]');
      const productUrlInput = document.querySelector('[name="productUrl"]');
      
      productNameInput.value = 'ab';
      priceInput.value = '0'
      productUrlInput.value = '';
      
      const result = validator.validate();
      
      expect(result.errors.productName).toBe('Название слишком короткое');
      expect(result.errors.price).toBe('Цена должна быть положительной');
      expect(result.errors.productUrl).toBe('Укажите URL товара');
      expect(result.errors.categories).toBeNull();
    });

    test('должен корректно обрабатывать checkbox', () => {
      const form = document.getElementById('complex-form');
      const validator = createValidator(form);
      
      const inStockCheckbox = document.querySelector('[name="inStock"]');
      
      inStockCheckbox.checked = true;
      validator.field('inStock');
      
      const validatorInstance = (validator).validators.get('inStock');
      expect(validatorInstance.getValue()).toBe(true);
      
      inStockCheckbox.checked = false;
      expect(validatorInstance.getValue()).toBe(false);
    });

    test('не должен находить поля вне формы', () => {
      const form = document.getElementById('complex-form');
      const validator = createValidator(form);
      
      expect(() => {
        validator.field('externalField');
      }).toThrow('Поле "externalField" не найдено в форме');
    });

    test('должен игнорировать disabled поля при сборе', () => {
      const form = document.getElementById('complex-form');
      const validator = createValidator(form);
      
      expect(() => {
        validator.field('archivedDate');
      }).not.toThrow();
      
      const archivedDateInput = document.querySelector('[name="archivedDate"]');
      expect(archivedDateInput.disabled).toBe(true);
    });

    test('должен показывать ошибки в правильных ячейках таблицы', () => {
      const form = document.getElementById('complex-form');
      const validator = createValidator(form);
      
      validator.field('productName').required();
      
      const productNameInput = document.querySelector('[name="productName"]');
      productNameInput.value = '';
      
      validator.validate();
      
      expect(productNameInput.classList.contains('error')).toBe(true);
      
      const errorMessage = productNameInput.parentElement?.parentElement
        ?.querySelector('.error-cell .error-message');
      
      expect(errorMessage).toBeTruthy();
      expect(errorMessage?.textContent).toBe('Поле обязательно для заполнения');
    });
  });

  describe('DOM 6: Форма с нестандартными элементами и JavaScript-генерацией', () => {
    let dom;
    let document;
    let window;

    beforeEach(() => {
      dom = new JSDOM(`
        <!DOCTYPE html>
        <html>
          <body>
            <form id="js-generated-form">
              <div id="dynamic-fields-container"></div>
              
              <div class="template" style="display: none;">
                <div class="dynamic-field">
                  <input type="text" class="dynamic-input" name="dynamic[]">
                  <button type="button" class="remove-btn">×</button>
                </div>
              </div>
              
              <button type="button" id="add-field">Добавить поле</button>
              <button type="submit">Отправить</button>
            </form>
          </body>
        </html>
      `, {
        runScripts: 'dangerously',
        resources: 'usable'
      });
      
      document = dom.window.document;
      window = dom.window;
      
      const template = document.querySelector('.template');
      const container = document.getElementById('dynamic-fields-container');
      
      window['addField'] = function(value = '') {
        const clone = template.cloneNode(true);
        clone.style.display = 'block';
        const input = clone.querySelector('.dynamic-input');
        input.value = value;
        input.setAttribute('field-name', `dynamic_${Date.now()}`);
        container.appendChild(clone);
      };
      
      window['addField']('Первое поле');
      window['addField']('Второе поле');
      window['addField']('');
    });

    test('должен обрабатывать динамически добавленные поля', () => {
      const form = document.getElementById('js-generated-form');
      const validator = createValidator(form);
      
      const dynamicInputs = document.querySelectorAll('.dynamic-input');
      expect(dynamicInputs.length).toBe(3);
      
      const lastInput = dynamicInputs[2];
      const fieldName = lastInput.getAttribute('field-name');
      
      if (fieldName) {
        validator.field(fieldName).required('Заполните это поле');
        
        const result = validator.validate();
        expect(result.errors[fieldName]).toBe('Заполните это поле');
        
        lastInput.value = 'Заполнено';
        const result2 = validator.validate();
        expect(result2.errors[fieldName]).toBeNull();
      }
    });

    test('должен обновлять список полей при изменении DOM', () => {
      const form = document.getElementById('js-generated-form');
      const formConnector = new (createValidator(form)).form;
      
      const initialFields = Array.from(formConnector.getFields().keys());
      expect(initialFields.length).toBeGreaterThanOrEqual(3);
      
      window['addField']('Новое поле');
      
      const newValidator = createValidator(form);
      const newFormConnector = (newValidator).form;
      
      const updatedFields = Array.from(newFormConnector.getFields().keys());
      expect(updatedFields.length).toBeGreaterThan(initialFields.length);
    });
  });

  describe('DOM 7: Форма с разными типами input и edge cases', () => {
    let dom;
    let document;

    beforeEach(() => {
      dom = new JSDOM(`
        <!DOCTYPE html>
        <html>
          <body>
            <form id="edge-cases-form">
              <!-- Range input -->
              <div>
                <label>Уровень: <span id="range-value">50</span>%</label>
                <input type="range" 
                       name="level" 
                       field-name="level"
                       min="0" 
                       max="100" 
                       value="50">
              </div>
              
              <!-- Color input -->
              <input type="color" name="color" field-name="color" value="#ff0000">
              
              <!-- File input -->
              <input type="file" name="file" field-name="file" accept=".jpg,.png">
              
              <!-- Date inputs -->
              <input type="date" name="birthday" field-name="birthday" value="1990-01-01">
              <input type="datetime-local" name="meetingTime" field-name="meetingTime">
              
              <!-- Radio buttons group -->
              <div class="radio-group" field-name="gender">
                <label>
                  <input type="radio" name="gender" value="male" checked> Мужской
                </label>
                <label>
                  <input type="radio" name="gender" value="female"> Женский
                </label>
                <label>
                  <input type="radio" name="gender" value="other"> Другое
                </label>
              </div>
              
              <!-- Contenteditable как поле -->
              <div class="editable" 
                   field-name="content" 
                   contenteditable="true"
                   data-placeholder="Введите текст...">
                Предварительный текст
              </div>
              
              <!-- Поле без value атрибута -->
              <input type="text" name="noValue" field-name="noValue">
              
              <!-- Поле с невалидным JSON -->
              <div field-name="invalidJson">{не json}</div>
            </form>
          </body>
        </html>
      `);
      document = dom.window.document;
    });

    test('должен корректно обрабатывать range input', () => {
      const form = document.getElementById('edge-cases-form');
      const validator = createValidator(form);
      
      const rangeInput = document.querySelector('[type="range"]');
      rangeInput.value = '75';
      
      validator.field('level').number().minNumber(0).maxNumber(100);
      
      const result = validator.validate();
      expect(result.errors.level).toBeNull();
      
      const validatorInstance = (validator).validators.get('level');
      expect(validatorInstance.getValue()).toBe(75);
    });

    test('должен обрабатывать color input', () => {
      const form = document.getElementById('edge-cases-form');
      const validator = createValidator(form);
      
      const colorInput = document.querySelector('[type="color"]');
      colorInput.value = '#00ff00';
      
      validator.field('color').required();
      
      const result = validator.validate();
      expect(result.errors.color).toBeNull();
      
      const validatorInstance = (validator).validators.get('color');
      expect(validatorInstance.getValue()).toBe('#00ff00');
    });

    test('должен обрабатывать radio buttons как группу', () => {
      const form = document.getElementById('edge-cases-form');
      const validator = createValidator(form);
      
      const maleRadio = document.querySelector('[value="male"]');
      const femaleRadio = document.querySelector('[value="female"]');
      
      maleRadio.checked = false;
      femaleRadio.checked = true;
      
      validator.field('gender').required('Выберите пол');
      
      const result = validator.validate();
      expect(result.errors.gender).toBeNull();
      
      const validatorInstance = (validator).validators.get('gender');
      expect(validatorInstance.getValue()).toBe('female');
    });

    test('должен обрабатывать contenteditable элементы', () => {
      const form = document.getElementById('edge-cases-form');
      const validator = createValidator(form);
      
      const editableDiv = document.querySelector('.editable');
      editableDiv.textContent = ''; 
      
      validator.field('content').required('Введите текст');
      
      const result = validator.validate();
      expect(result.errors.content).toBe('Введите текст');
      
      // Заполняем
      editableDiv.textContent = 'Новый текст';
      const result2 = validator.validate();
      expect(result2.errors.content).toBeNull();
    });

    test('должен обрабатывать поля без value атрибута', () => {
      const form = document.getElementById('edge-cases-form');
      const validator = createValidator(form);
      
      const noValueInput = document.querySelector('[name="noValue"]');
      noValueInput.value = '';
      
      validator.field('noValue').required();
      
      const result = validator.validate();
      expect(result.errors.noValue).toBe('Поле обязательно для заполнения');
    });

    test('должен обрабатывать невалидный JSON как null', () => {
      const form = document.getElementById('edge-cases-form');
      const validator = createValidator(form);
      
      const invalidJsonDiv = document.querySelector('[field-name="invalidJson"]') ;
      invalidJsonDiv.textContent = '{не валидный json}';
      
      validator.field('invalidJson').array();
      
      const result = validator.validate();
      expect(result.errors.invalidJson).toBe('Поле должно быть массивом');
    });

    test('должен возвращать null для file input', () => {
      const form = document.getElementById('edge-cases-form');
      const validator = createValidator(form);
      
      validator.field('file');
      
      const validatorInstance = (validator).validators.get('file');
      expect(validatorInstance.getValue()).toBeNull();
    });
  });
});