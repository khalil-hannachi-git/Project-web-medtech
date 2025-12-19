import React from 'react';
import { Card, CardBody, CardTitle } from 'reactstrap';

const QuizzCard = ({ quizz }) => {
  return (
    <Card>
      <CardTitle tag="h5" component="h2">
        {quizz.name}
      </CardTitle>
      <CardBody>
        <p>{quizz.description}</p>
        {/* Add more content related to the Quizz */}
      </CardBody>
    </Card>
  );
};

export default QuizzCard;