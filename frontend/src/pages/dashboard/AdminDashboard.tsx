import React from "react";
import { BaseLayout } from "@layouts/BaseLayout";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Card, Row, Col, Container } from "react-bootstrap";

interface AdminDashboardProps {
  userName: string;
  isAdmin: boolean;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ userName, isAdmin }) => {
  
  // Simulação de dados
  const stats = [
    { title: "Usuários Cadastrados", value: 120, bg: "primary" },
    { title: "Livros Disponíveis", value: 450, bg: "success" },
    { title: "Empréstimos Ativos", value: 78, bg: "warning" },
    { title: "Livros Atrasados", value: 15, bg: "danger" },
  ];

  return (
    <BaseLayout userName={userName} isAdmin={isAdmin}>
      <Container className="mt-4">
        <h2 className="mb-4">Dashboard do Administrador</h2>
        <Row xs={1} sm={2} md={2} lg={4} className="g-4">
          {stats.map((stat, index) => (
            <Col key={index}>
              <Card className={`text-white bg-${stat.bg} h-100`}>
                <Card.Body>
                  <Card.Title>{stat.title}</Card.Title>
                  <Card.Text className="display-6">{stat.value}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </BaseLayout>
  );
};
