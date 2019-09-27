import path from 'path';
import test from 'ava';
import sinon from 'sinon';
import sutFactory from '../fileIO.mjs';

const utilStub = {
  promisify: (fn) => fn,
};

function getFsStub(returnText) {
  return {
    readFile: sinon.stub().returns(returnText),
  };
}

const papaStub = {
  parse: sinon.stub().returns({ data: [{ firstName: 'one' }, { firstName: 'two' }, { firstName: 'three' }] }),
}

test('getProject() opens the specified file', async (t) => {
  const fsStub = getFsStub('{ "item1": 1 }');
	const sut = sutFactory({
    path,
    util: utilStub,
    fs: fsStub,
    Papa: papaStub,
  });
  await sut.getProject('someFile.json');
  t.is(fsStub.readFile.calledWith(`${process.cwd()}/someFile.json`), true);
});

test('getProject() parses the open file as JSON', async (t) => {
  const fsStub = getFsStub('{ "item1": 1 }');
	const sut = sutFactory({
    path,
    util: utilStub,
    fs: fsStub,
    Papa: papaStub,
  });
  const result = await sut.getProject('someFile.json');
  t.deepEqual(result, { item1: 1 });
});

test('getRespondents() opens the specified file', async t => {
  const fsStub = getFsStub('');
	const sut = sutFactory({
    path,
    util: utilStub,
    fs: fsStub,
    Papa: papaStub,
  });
  await sut.getRespondents('someFile.csv');
  t.is(fsStub.readFile.calledWith(`${process.cwd()}/someFile.csv`), true);
});

test('getRespondents() uses parseRespondentFile to parse the open file as CSV', async (t) => {
  const fsStub = getFsStub('');
	const sut = sutFactory({
    path,
    util: utilStub,
    fs: fsStub,
    Papa: papaStub,
  });
  sut.parseRespondentFile = sinon.stub()
  await sut.getRespondents('someFile.csv');
  t.is(sut.parseRespondentFile.calledOnce, true);
});

test('parseRespondentFile() parses the passed string as CSV', async (t) => {
  const fsStub = getFsStub('');
	const sut = sutFactory({
    path,
    util: utilStub,
    fs: fsStub,
    Papa: papaStub,
  });
  await sut.parseRespondentFile('one,two,three');
  t.is(papaStub.parse.calledWith('one,two,three'), true);
})