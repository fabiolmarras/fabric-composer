/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const Script = require('../../lib/introspect/script');
const ModelManager = require('../../lib/modelmanager');
const sinon = require('sinon');

describe('Script', () => {
    let modelManager;

    beforeEach(() => {
        modelManager = new ModelManager();
    });

    afterEach(() => {
    });

    describe('#constructor', () => {

        it('should throw when null content provided', () => {
            (() => {
                new Script(modelManager, 'SCRIPT_001', 'JS', null );
            }).should.throw(/Empty script contents/);
        });
    });

    describe('#accept', () => {

        it('should call the visitor', () => {
            const FUNC_TEXT = 'function foo() {return 0;}';
            let script = new Script(modelManager, 'SCRIPT_001', 'JS', FUNC_TEXT );
            let visitor = {
                visit: sinon.stub()
            };
            script.accept(visitor, ['some', 'args']);
            sinon.assert.calledOnce(visitor.visit);
            sinon.assert.calledWith(visitor.visit, script, ['some', 'args']);
        });
    });

    describe('#parsing', () => {

        it('should parse no args function', () => {
            const FUNC_TEXT = 'function foo() {return 0;}';
            const script = new Script(modelManager, 'SCRIPT_001', 'JS', FUNC_TEXT );
            script.getFunctionDeclarations().length.should.equal(1);
            script.getLanguage().should.equal('JS');
            script.getContents().should.equal(FUNC_TEXT);
            const func = script.getFunctionDeclarations()[0];
            func.getName().should.equal('foo');
            func.getThrows().should.equal('');
            func.getFunctionText().should.equal(FUNC_TEXT);
            func.getLanguage().should.equal('JS');
            func.getVisibility().should.equal('+');
            (func.getTransactionDeclarationName() === null).should.be.true;
        });

        it('should throw for a TX processor function that does not have 1 parameter', () => {
            const FUNC_TEXT = '/*@transaction*/ function onMyTransaction() {return 0;}';
            (() => {
                new Script(modelManager, 'SCRIPT_001', 'JS', FUNC_TEXT );
            }).should.throw(/must have 1 function argument/);
        });

        it('should parse complex function', () => {
            const COMMENT =
`
/**
 * @param {string} myParam - this is a test
 * @return {boolean} - sample return value
 * @throws {Error} - sample throws
 */
`;
            const FUNC_TEXT =
`function bar(myParam) {
  console.log(myParam);
  return false;
}`;
            const script = new Script(modelManager, 'SCRIPT_002', 'JS', COMMENT + FUNC_TEXT );
            script.getIdentifier().should.equal('SCRIPT_002');
            script.getFunctionDeclarations().length.should.equal(1);
            const func = script.getFunctionDeclarations()[0];
            func.getName().should.equal('bar');
            func.getThrows().should.equal('Error');
            func.getReturnType().should.equal('boolean');
            func.getParameterNames()[0].should.equal('myParam');
            func.getParameterTypes()[0].should.equal('string');
            func.getFunctionText().should.equal(FUNC_TEXT);
        });
    });

    describe('#toJSON', () => {

        it('should return an object', () => {
            const FUNC_TEXT = 'function foo() {return 0;}';
            let script = new Script(modelManager, 'SCRIPT_001', 'JS', FUNC_TEXT );
            script.toJSON().should.deep.equal({
                identifier: 'SCRIPT_001',
                language: 'JS'
            });
        });

    });
});
