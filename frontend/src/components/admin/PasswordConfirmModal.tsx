import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

interface PasswordConfirmModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: (password: string) => void;
  actionLabel: string;
}

export const PasswordConfirmModal: React.FC<PasswordConfirmModalProps> = ({
  show,
  onClose,
  onConfirm,
  actionLabel,
}) => {
  const [password, setPassword] = useState("");

  const handleConfirm = () => {
    if (!password) {
      alert("Por favor, digite sua senha.");
      return;
    }
    onConfirm(password); // executa a ação
    setPassword("");      // limpa o campo
    onClose();            // fecha o modal automaticamente
  };

  const handleClose = () => {
    setPassword("");
    onClose();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Confirme sua senha</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group>
          <Form.Label>Digite sua senha para {actionLabel.toLowerCase()}</Form.Label>
          <Form.Control
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleConfirm}>
          {actionLabel}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
