import { TestBed } from '@angular/core/testing';

import { CartModel } from './cart.model';

describe('CartModel', () => {
  let service: CartModel;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CartModel);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
