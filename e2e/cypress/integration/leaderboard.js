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

            .get(".leader-element-name", {timeout: 20000}).first().should('contain', 'Sereres')

            .get(":nth-child(7) > .leaderboard__cell--name").should('contain', 'Seamus')
            .get(":nth-child(7) > .leaderboard__cell--weeks").should('contain', '0')
            .get(":nth-child(7) > .leaderboard__cell--picks").should('contain', '1')

            .get("#Seamus-GB\\@CHI")
            .click()
            .type('{backspace}{backspace}')
            .invoke('blur')
    });
});