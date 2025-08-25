/// <reference types="cypress" />

describe('메인 사용자 플로우', () => {
  it('로그인 → 상품 검색 → 장바구니 담기 → 결제', () => {
    cy.visit('/login');
    cy.get('input[id=email]').type('testuser@example.com');
    cy.get('input[id=password]').type('password123');
    cy.get('button[type=submit]').click();

    cy.url().should('include', '/home');
    cy.get('input[placeholder="상품 검색"]').type('셔츠');
    cy.contains('셔츠').click();

    cy.contains('장바구니').click();
    cy.contains('결제하기').click();

    cy.url().should('include', '/payment');
    cy.contains('결제 완료').should('exist');
  });
});
