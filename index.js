var express = require('express');
const request = require('request');
var app = express();
var router = express.Router();

const url_poliza = 'https://dn8mlk7hdujby.cloudfront.net/interview/insurance/policy'

// round float to 3 decimals
function round_float(number){
    return Math.round( number * 1e3 ) / 1e3;
}

function get_life_policy_cost(childrens){
    const cost_life_policy = [0.279, 0.4396, 0.5599];

    if( childrens > 2 )
        childrens = 2;

    return cost_life_policy[childrens];
}

function get_dental_policy_cost(childrens){
    const cost_dental_policy = [0.12, 0.195, 0.248];

    if( childrens > 2 )
        childrens = 2;

    return cost_dental_policy[childrens];
}

// calculate the cost of policy for the company
function get_policy_cost(company){
    let company_percentage = company.company_percentage;
    let n_employees = 0;

    let policy_cost = 0;
    for( i = 0 ; i < company.workers.length; i++ ){
        let worker = company.workers[i];
        if( worker.age > 65)
            continue;       // without coverage

        // get the cost
        policy_cost += get_life_policy_cost(worker.childs);
        if( company.has_dental_care )
            policy_cost += get_dental_policy_cost(worker.childs);

        n_employees++;
    }

    let company_cost = policy_cost * (company_percentage / 100);
    let employee_cost = (policy_cost - company_cost) / n_employees;

    // return dictionary with company and employee cost
    return {
        'Costo Empresa': round_float(company_cost),
        'Costo por Empleado': round_float(employee_cost),
        'Numero de empleados': n_employees
    }
}

/* call the endpoint for getting company detail and return policy cost */
app.get('/', function(req, res) {

  request.get(url_poliza, (err, output, body) => {
      if (err || output.statusCode != 200)
        {
            res.json({'error': 'No puede obtener datos de la empresa, intente mas tarde'})
            return;
        }

      // get json with response from the endpoint
      let company_detail = JSON.parse(body);

      // calculate the company cost
      let poliza = get_policy_cost(company_detail.policy);

      // round UF to 3 decimals
      res.json(poliza);
  });
});

app.listen(3001, function() {
    console.log("My API is running on port 3001...:" + "http://localhost:3001");
});

module.exports = router;
