const bd = require('../bd/bd_utils.js');
const modelo = require('../modelo.js');

beforeEach(() => {
  bd.reconfig('./bd/esmforum-teste.db');
  // limpa dados de todas as tabelas
  bd.exec('delete from perguntas', []);
  bd.exec('delete from respostas', []);
});

test('Testando banco de dados vazio', () => {
  expect(modelo.listar_perguntas().length).toBe(0);
});

test('Testando cadastro de três perguntas', () => {
  modelo.cadastrar_pergunta('1 + 1 = ?');
  modelo.cadastrar_pergunta('2 + 2 = ?');
  modelo.cadastrar_pergunta('3 + 3 = ?');
  const perguntas = modelo.listar_perguntas(); 
  expect(perguntas.length).toBe(3);
  expect(perguntas[0].texto).toBe('1 + 1 = ?');
  expect(perguntas[1].texto).toBe('2 + 2 = ?');
  expect(perguntas[2].num_respostas).toBe(0);
  expect(perguntas[1].id_pergunta).toBe(perguntas[2].id_pergunta-1);
});

test('Testando cadastrar_resposta e get_respostas', () => {
  const id_pergunta = modelo.cadastrar_pergunta('Qual a capital da França?');
  const id_resposta = modelo.cadastrar_resposta(id_pergunta, 'Paris');
  expect(typeof id_resposta).toBe('number');
  const respostas = modelo.get_respostas(id_pergunta);
  expect(respostas.length).toBe(1);
  expect(respostas[0].texto).toBe('Paris');
});

test('Testando get_pergunta', () => {
  const id_pergunta = modelo.cadastrar_pergunta('Qual a cor do céu?');
  const pergunta = modelo.get_pergunta(id_pergunta);
  expect(pergunta.texto).toBe('Qual a cor do céu?');
  expect(pergunta.id_pergunta).toBe(id_pergunta);
});

test('Testando get_num_respostas', () => {
  const id_pergunta = modelo.cadastrar_pergunta('2 + 2 = ?');
  expect(modelo.get_num_respostas(id_pergunta)).toBe(0);
  modelo.cadastrar_resposta(id_pergunta, '4');
  expect(modelo.get_num_respostas(id_pergunta)).toBe(1);
});

test('Testando reconfig_bd com mock', () => {
  const mock_bd = {
    queryAll: jest.fn(() => [{ id_pergunta: 1 }]),
    exec: jest.fn(() => ({ lastInsertRowid: 42 })),
    query: jest.fn(() => ({ 'count(*)': 7 }))
  };
  modelo.reconfig_bd(mock_bd);
  expect(modelo.listar_perguntas()[0].id_pergunta).toBe(1);
  expect(modelo.cadastrar_pergunta('mock')).toBe(42);
  expect(modelo.cadastrar_resposta(1, 'mock')).toBe(42);
  expect(modelo.get_pergunta(1)).toEqual({ 'count(*)': 7 });
  expect(modelo.get_respostas(1)).toEqual([{ id_pergunta: 1 }]);
  expect(modelo.get_num_respostas(1)).toBe(7);
});
