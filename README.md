# react-bootstrap-table
react bootstrap table for view large data

React компонет для отображения таблиц в bootstrap. Таблица имеет фиксированный 
заголовок, а так же позволяет быстро просматривать большие массивы (проверено на 1000000 записей).<br>
`Контейнер, в котором формируется таблица должен иметь фиксированную высоту либо maxHeight:100%`

Пример использования:
```javascript
import React from 'react';
import Table from "fmihel-react-bootstrap-table";

class App extends React.Component {
    render() {
        return (
            <div className="container-fluid" >
                <div className="row">
                    <div className="col">
                        Table
                    </div>
                </div>
                <div className="row">
                    <div className="col" style={{ height: '200px' }}>
                        <Table
                            data={this.props.data}
                            fields ={this.props.fields}
                            css={'table-sm table-bordered table-striped table-hover'}
                            light={false}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

function getData(count) {
    const res = [];
    for (let i = 0; i < count; i++) {
        res.push({
            id: i, 
            name: `name ${i}`, 
            age: i * 10, 
            date: `${i}/${i * 10}/${i * 100}`,
        });
    }
    return res;
}


App.defaultProps = {
    data: getData(2000),
    fields: [
        { name: 'id', width: 30 }, 
        { name: 'name' }, 
        { name: 'age' }, 
        { name: 'date' }
    ],
};

```
