import React from 'react';
import { connect } from 'react-redux';
import { Button, Label, Divider, Modal, Icon, Header, Form, Message, Table, Dropdown } from 'semantic-ui-react';
import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
//import _ from 'lodash';

import { LayoutUser, MainMenu, SimplePaginate, slugify, fromObjectToList, randomString, DisplayTimeAgo } from '../../layout';
import { db } from '../../firebase';

const treeName = "articles";
const treeName2 = "categories";
const INITIAL_STATE = {title: '', desc: '', error: '', success: '', loading: false}

class AddDataModal extends React.Component {
    state = {open: false, ...INITIAL_STATE, categories: [], categoryId: null}
    closeConfigShow = (closeOnEscape) => () => {this.setState({closeOnEscape, open: true})}
    close = () => this.setState({open: false})
    handleSubmit = async (e) => {
        e.preventDefault();
        this.setState({loading: true, error: '', success: ''})
        const articleId = randomString(28);
        db.ref(treeName).child(articleId).set({
            title: this.state.title,
            slug: slugify(this.state.title),
            author: this.props.displayName || 'Admin',
            uid: this.props.uid || 'xxx',
            articleId: articleId,
            categoryId: this.state.categoryId,
            desc: this.state.desc,
            date: Math.floor(Date.now()),
        })
        this.setState({title: '', desc: '', loading: false, open: false});
        this.props.getDatalistRefresh();
    }
    handleInput = async e => {
        const search = e.target.value;
        let categories = []
        if (!!search && search.length > 1) {
            let qref = db.ref(treeName2)
            qref = qref.orderByChild("slug").startAt(search).endAt(search+"\uf8ff")
            const snapshot = await qref.once('value');
            const options = fromObjectToList(snapshot.val());
            categories = options.map((val, key) => ({key, value: val.categoryId, text: val.name}))
        }
        this.setState({categories})
    }
    render = () => {
        const { open, closeOnEscape, title, desc } = this.state;
        const isValid = title !== '' && desc !== '';
        return (
            <React.Fragment>
                <Button floated='right' size="mini" color='orange' onClick={this.closeConfigShow(false, true)}><Icon name='plus' />New Article</Button>
                <Modal closeOnEscape={closeOnEscape} onClose={this.close} open={open} size='large'>
                    <Modal.Header>Add New Article</Modal.Header>
                    <Modal.Content>
                        <Modal.Description>
                            <Form onSubmit={this.handleSubmit} error={!!this.state.error}>
                                {!!this.state.error && <Message error visible header="Error!" content={this.state.error} />}
                                {!!this.state.success && <Message error visible header="Success!" content={this.state.success} />}
                                <Form.Field>
                                    <label>Title</label>
                                    <input 
                                        type="text"
                                        value={title}
                                        onChange={e => this.setState({title: e.target.value})}
                                        placeholder="Title"
                                    />
                                </Form.Field>
                                <Form.Field>
                                    <label>Category</label>
                                    <Dropdown 
                                        placeholder="Select Category"
                                        fluid
                                        search
                                        selection
                                        onInput={this.handleInput}
                                        onChange={(e, { value }) => this.setState({ categoryId: value })}
                                        options={this.state.categories}
                                    />
                                </Form.Field>
                                <Form.Field>
                                    <SimpleMDE
                                        id="addnewarticledesc"
                                        label="Description"
                                        onChange={value => this.setState({desc: value})}
                                        value={desc}
                                        options={{
                                            autofocus: false,
                                            spellChecker: true,
                                        }}
                                    />
                                </Form.Field>
                                <Button loading={this.state.loading} disabled={!isValid} primary>Save</Button>
                            </Form>
                        </Modal.Description>
                    </Modal.Content>
                </Modal>
            </React.Fragment>
        )
    }
}

class EditDataModal extends React.Component {
    constructor(props){
        super(props)
        this.state = {open: false, loading: false, error: '', success: '', ...props.dataRow}
    }
    closeConfigShow = (closeOnEscape) => () => {this.setState({closeOnEscape, open: true})}
    close = () => this.setState({open: false})
    handleSubmit = async (e) => {
        e.preventDefault()
        this.setState({loading: true, error: '', success: ''})
        const { articleId } = this.state;
        db.ref(treeName).child(articleId).update({
            title: this.state.title,
            slug: slugify(this.state.title),
            author: this.state.displayName || 'Admin',
            uid: this.state.uid || 'xxx',
            articleId: articleId,
            desc: this.state.desc,
            date: Math.floor(Date.now()),
        })
        this.setState({loading: false, open: false})
        this.props.getDatalistRefresh();
    }
    handleInput = async e => {
        const search = e.target.value;
        let categories = []
        if (!!search && search.length > 1) {
            let qref = db.ref(treeName2)
            qref = qref.orderByChild("slug").startAt(search).endAt(search+"\uf8ff")
            const snapshot = await qref.once('value');
            const options = fromObjectToList(snapshot.val());
            categories = options.map((val, key) => ({key, value: val.categoryId, text: val.name}))
        }
        this.setState({categories})
    }
    componentDidMount(){
        this.handleInput({target:{value: this.state.categoryId}})
    }
    render = () => {
        const { title, desc} = this.state
        const isValid = title !== '' && desc !== ''
        return (
            <React.Fragment>
                <span onClick={this.closeConfigShow(false, true)} style={{ cursor: 'pointer' }}><Icon name="edit outline" color="blue" /></span>
                <Modal closeOnEscape={this.state.closeOnEscape} onClose={this.close} open={this.state.open} size='large'>
                    <Modal.Header>Edit Article</Modal.Header>
                    <Modal.Content>
                        <Modal.Description>
                            <Form onSubmit={this.handleSubmit} error={!!this.state.error}>
                                {!!this.state.error && <Message error visible header="Error!" content={this.state.error} />}
                                {!!this.state.success && <Message error visible header="Success!" content={this.state.success} />}
                                <Form.Field>
                                    <label>Title</label>
                                    <input 
                                        type="text"
                                        value={title}
                                        onChange={e => this.setState({title: e.target.value})}
                                        placeholder="Title"
                                    />
                                </Form.Field>
                                <Form.Field>
                                    <label>Category</label>
                                    <Dropdown 
                                        placeholder="Select Category"
                                        fluid
                                        search
                                        selection
                                        onInput={this.handleInput}
                                        onChange={(e, { value }) => this.setState({ categoryId: value })}
                                        options={this.state.categories}
                                        value={this.state.categoryId}
                                    />
                                </Form.Field>
                                <Form.Field>
                                    <SimpleMDE
                                        id="editarticledesc"
                                        label="Description"
                                        onChange={value => this.setState({desc: value})}
                                        value={desc}
                                        options={{
                                            autofocus: false,
                                            spellChecker: true,
                                        }}
                                    />
                                </Form.Field>
                                <Button loading={this.state.loading} disabled={!isValid} primary>Save</Button>
                            </Form>
                        </Modal.Description>
                    </Modal.Content>
                </Modal>
            </React.Fragment>
        )
    }
}

class DataRow extends React.Component {
    state = {open: false}
    closeConfigShow = (closeOnEscape) => () => {this.setState({closeOnEscape, open: true})}
    close = () => this.setState({open: false})
    handleDelete = async articleId => {
        await db.ref(treeName).child(articleId).remove();
        this.props.getDatalistRefresh();
    }
    deleteModal = articleId => {
        const { open, closeOnEscape } = this.state;
        return (
            <React.Fragment>
                <span onClick={this.closeConfigShow(false, true)} style={{ cursor: 'pointer' }}><Icon name='trash alternate outline' color='red' /></span>
                <Modal closeOnEscape={closeOnEscape} onClose={this.close} open={open} basic size='tiny'>
					<Header icon='trash alternate outline' content="Delete Article" />
					<Modal.Content>
						<p>Are you sure to delete this article?</p>
					</Modal.Content>
					<Modal.Actions>
						<Button color='green' onClick={() => this.handleDelete(articleId)} inverted><Icon name='checkmark' /> Yes</Button>
						<Button basic color='red' onClick={this.close} inverted><Icon name='remove' /> No</Button>
					</Modal.Actions>
				</Modal>
            </React.Fragment>
        )
    }
    render = () => {
        const { Row, Cell } = Table;
        const { title, articleId, date } = this.props.dataRow;
        return (
            <Row>
                <Cell>{title}</Cell>
                <Cell>{articleId}</Cell>
                <Cell><DisplayTimeAgo time={date} isTimeAgo={true} /></Cell>
                <Cell>
                    <EditDataModal {...this.props} />
                    {this.deleteModal(articleId)}
                </Cell>
            </Row>
        )
    }
}

class Articles extends React.Component {
    constructor(props){
        super(props);
        this._isMounted = false;
        this.state = {
            currentPage: 1,
            perPage: 20,
            totalItemCount: 1,
            datalistStack:[],
            datalist: [],
            searchFilter: "",
        }
    }
    getDatalistCount = async () => await db.ref(treeName).once("value", snapshot => this.setState({totalItemCount: snapshot.numChildren()}))
    getDatalist = async (queryDict={}) => {
        const { currentPage, perPage, datalistStack } = this.state;
        const startAt = currentPage * perPage - perPage;
        const direction = queryDict.hasOwnProperty("direction")?queryDict.direction: 'next';
        const searchFilter = queryDict.hasOwnProperty("searchFilter")?queryDict.searchFilter:'';
        let qref = db.ref(treeName)
        let datalist;
        if (direction === 'next') {
            if (startAt > 0) {
                const lastObj = this.state.datalist[this.state.datalist.length - 1];
                qref = qref.startAt(lastObj.articleId);
            }
            if (datalistStack.hasOwnProperty(this.currentPage)) {
                datalist = datalistStack[currentPage - 1];
            } else {
                qref = qref.orderByKey().limitToFirst(perPage + 1);
                const snapshot = await qref.once("value")
                datalist = fromObjectToList(snapshot.val())
                datalistStack.push(datalist);
            }
        } else if (direction === 'prev') {
            datalist = datalistStack[currentPage - 1]
        }
        if (datalist === null) {datalist = []}
        this.setState({datalist, searchFilter});
    }
    getDatalistRefresh = () => {
        this._isMounted && this.setState({datalistStack: []}, async () => {
            await this.getDatalistCount();
            await this.getDatalist();
        })
    }
    getDatalistPartial(){
        let { datalist, perPage } = this.state;
        if (datalist.length === perPage + 1) {datalist = datalist.slice(0, -1)}
        return datalist;
    }
    handlePageClick = direction => {
        const nextPage = direction === 'next' ? this.state.currentPage + 1 : this.state.currentPage - 1;
        this.setState({currentPage: nextPage}, async () => {
            await this.getDatalist({direction});
        });
    }
    componentWillUnmount(){this._isMounted = false;}
    componentDidMount(){
        this._isMounted = true; this.getDatalistRefresh();
    }
    render = () => {
        const { Header, Row, HeaderCell, Body } = Table;
        const datalist = this.getDatalistPartial();
        return (
            <LayoutUser>
                <MainMenu history={this.props.history} />
                <h3>All Articles <Label floated="right">Total {this.state.totalItemCount}</Label>
                    <AddDataModal getDatalistRefresh={this.getDatalistRefresh} uid={this.props.uid} displayName={this.props.displayName} />
                </h3>
                <Divider />
                <Table>
                    <Header>
                        <Row>
                            <HeaderCell>Title</HeaderCell>
                            <HeaderCell>ID</HeaderCell>
                            <HeaderCell>Time</HeaderCell>
                            <HeaderCell><Icon name='ellipsis horizontal' /></HeaderCell>
                        </Row>
                    </Header>
                    <Body>
                        {datalist.length > 0 && datalist.map((dataRow, key) => 
                            <DataRow key={key} getDatalistRefresh={this.getDatalistRefresh} dataRow={dataRow} />
                        )}
                    </Body>
                </Table>
                <SimplePaginate 
                    page={this.state.currentPage}
                    totalPages={Math.ceil(this.state.totalItemCount / this.state.perPage)}
                    handlePageClick={this.handlePageClick}
                />
            </LayoutUser>
        )
    }
}

const mapStateToProps = state => {
    const { authUser } = state.sessionState
    //console.log(authUser)
    return {
        isAuthenticated: !!authUser,
        token: !!authUser && authUser.uid,
        displayName: !!authUser && authUser.displayName,
        email: !!authUser && authUser.email,
        emailVerified: !!authUser && authUser.emailVerified,
    }
}

export default connect(mapStateToProps, null)(Articles);