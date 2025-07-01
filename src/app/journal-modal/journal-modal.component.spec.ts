import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JournalModalComponent } from './journal-modal.component';

describe('JournalModalComponent', () => {
  let component: JournalModalComponent;
  let fixture: ComponentFixture<JournalModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JournalModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JournalModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
