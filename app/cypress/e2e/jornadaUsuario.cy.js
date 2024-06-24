describe('Realizando transações', () => {
  const novaTransacao = {
    tipoTransacao: 'Depósito',
    valor: '100',
  };

  it('Deve permitir que usuário acesse a aplicação, realize transações e faça um logout', () => {
    cy.fixture('usuarios').as('usuario');
    cy.get('@usuario').then((usuario) => {
      cy.login(usuario[0].email, usuario[0].senha);

      cy.visit('/home');
      cy.url().should('include', '/home');

      cy.contains(usuario[0].nome).should('be.visible');

      cy.getByData('titulo-boas-vindas').should(
        'contain',
        'Bem vindo de volta!'
      );

      cy.getByData('select-opcoes').select(novaTransacao.tipoTransacao);
      cy.getByData('select-opcoes').should(
        'have.value',
        novaTransacao.tipoTransacao
      );

      cy.getByData('form-input').type(novaTransacao.valor);

      cy.getByData('form-input').should('have.value', novaTransacao.valor);

      cy.getByData('realiza-transacao').click();

      cy.getByData('lista-transacoes')
        .find('li')
        .last()
        .contains(novaTransacao.valor);

      cy.window().then((win) => {
        const userId = win.localStorage.getItem('userId');
        cy.request({
          method: 'GET',
          url: `http://localhost:8000/users/${userId}/transations`,
          failOnStatusCode: false,
        }).then((resposta) => {
          expect(resposta.status).to.eq(200);
          expect(resposta.body).is.not.empty;
          expect(resposta.body).to.have.lengthOf.at.least(1);
          expect(resposta.body[resposta.body.length - 1]).to.deep.include(
            novaTransacao
          );
        });
      });

      cy.getByData('botao-sair').click();

      cy.url().should('include', '/');

      cy.getByData('titulo-principal').contains(
        'Experimente mais liberdade no controle da sua vida financeira. Crie sua conta com a gente!'
      );
    });
  });
});
