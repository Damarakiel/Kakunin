import { filters } from './filters';
import { expect } from 'chai';

const world = {
  currentUser: {
    account: {
      email: 'some@email.com'
    }
  }
};

describe('Email filters', () => {
  it('throws an error when no filter was found', () => {
    expect(() => filters.filter(['some email content'], 'unknown-filter-type', 'some-value', world))
      .to.throw('Could not find filter for unknown-filter-type.');
  });

  it('return emails matching given filter', () => {
    const emails = [
      { to_email: 'other@email.com' },
      { to_email: 'some@email.com' },
      { to_email: 'other@email.com' },
      { to_email: 'some@email.com' },
      { to_email: 'other@email.com' },
      { to_email: 'some@email.com' }
    ];

    const filteredEmails = filters.filter(emails, 'currentUser', undefined, world);

    expect(filteredEmails.length).to.equal(3);

    filteredEmails.forEach((email) => expect(email.to_email).to.equal('some@email.com'));
  });
});
