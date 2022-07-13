import * as fs from 'fs-extra';
import * as path from 'path';
import * as tmp from 'tmp';

const proxyquire;

describe('OutputChannelLogger tests', function() {
  this.timeout(999999);
  let OutputChannelLogger;
  const tempFolders: Record<string, tmp.DirResult> = {};
  let logger: any;
  let mockOutputChannel: Record<string, sinon.SinonStub>;

  beforeEach(async () => {
    OutputChannelLogger = createModule().OutputChannelLogger;
    tempFolders.globalStoragePath = tmp.dirSync({ prefix: 'logging-tests-global' });
    tempFolders.storagePath = tmp.dirSync({ prefix: 'logging-tests-workspace' });
    logger = new OutputChannelLogger('test-logger');
  });

  afterEach(() => {
    tempFolders.globalStoragePath.removeCallback();
    tempFolders.storagePath.removeCallback();
  });

  it('should log to the output channel', async () => {
    await logger.log('xxx');
    expect(mockOutputChannel.appendLine).toBeCalledWith('xxx');
    expect(mockOutputChannel.append).not.toBeCalledWith('xxx');

    await logger.log('yyy', { trailingNewline: false });
    expect(mockOutputChannel.appendLine).not.toBeCalledWith('yyy');
    expect(mockOutputChannel.append).toBeCalledWith('yyy');

    await logger.log('zzz', createLogOptions('hucairz'));

    // should have created 1 side log
    expect(fs.readdirSync(tempFolders.storagePath.name)).toEqual(['hucairz']);
  });

  it('should create a side log', async () => {
    await logger.log('xxx', createLogOptions('first'));
    await logger.log('yyy', createLogOptions('second'));
    await logger.log('zzz', createLogOptions('first', false));
    await logger.log('aaa');

    // expect 2 side logs
    expect(fs.readdirSync(tempFolders.storagePath.name).length).toBe(2);

    // contents
    expect(fs.readFileSync(path.join(tempFolders.storagePath.name, 'first'), 'utf8')).toBe('xxx\nzzz');
    expect(fs.readFileSync(path.join(tempFolders.storagePath.name, 'second'), 'utf8')).toBe('yyy\n');
  });

  function createModule(): any {
    mockOutputChannel = {
      append: jest.fn(),
      appendLine: jest.fn(),
      show: jest.fn(),
      dispose: jest.fn(),
    };

    return proxyquire('../../src/logging', {
      vscode: {
        window: {
          createOutputChannel: () => mockOutputChannel
        },
        Disposable: function() {
          /**/
        },
        '@noCallThru': true,
        '@global': true
      }
    });
  }

  function createLogOptions(additionalLogLocation: string, trailingNewline?: boolean) {
    return {
      additionalLogLocation: path.join(tempFolders.storagePath.name, additionalLogLocation),
      trailingNewline,
    };
  }
});
