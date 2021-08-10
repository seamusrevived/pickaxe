describe('leaderboard', () => {
    beforeEach(() => {
        cy.visit('localhost:8080/pickaxe')
            .get('#change-week--back').click()
            .get('#change-week--back').click()
    })

    it('has starting picks', () => {
        cy.get(".leaderboard__cell--name").first().should('contain', 'Seamus');
        cy.get(".leaderboard__cell--weeks").first().should('contain', '1');
        cy.get(".leaderboard__cell--picks").first().should('contain', '2');
    });

    it('rankings change with picks', () => {

        cy.get("#Seamus-GB\\@CHI")
            .click()
            .type('go')
            .invoke('blur')

            .get(".leaderboard__cell--name", {timeout: 20000}).first().should('contain', 'Sereres')

            .get(".leaderboard__cell--name").eq(2).should('contain', 'Seamus')
            .get(".leaderboard__cell--weeks").eq(2).should('contain', '0')
            .get(".leaderboard__cell--picks").eq(2).should('contain', '1')

            .get("#Seamus-GB\\@CHI")
            .click()
            .type('{backspace}{backspace}')
            .invoke('blur')
    });
});