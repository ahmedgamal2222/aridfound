import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SIdebarComponent } from './sIdebar.component';

describe('SIdebarComponent', () => {
  let component: SIdebarComponent;
  let fixture: ComponentFixture<SIdebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SIdebarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SIdebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
