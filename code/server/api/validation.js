'use strict';

function rfidIsValid(str){
    const regex = /^\d{32}$/;
    return regex.test(str);
}

function posFieldIsValid(str) {
    const regex = /^\d{4}$/;
    return regex.test(str);
}

function positionIdIsValid(str) {
    const regex = /^\d{12}$/;
    return str.match(regex);
  }
  

function dateIsValid(dateStr, compare=true) {
    const regex = /^\d{4}\/\d{2}\/\d{2}$/;
    const regex2 = /^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}$/;
  
    if (!dateStr.match(regex) && !dateStr.match(regex2)) {
      return false;
    }
  
    if (compare) {
      const now = new Date();
      if(dateStr.match(regex2)){
          const [date, time] = dateStr.split(' ');
          const [year, month, day] = date.split('/');
          const [hour, minute] = time.split(':');
          const myDate = new Date(year, month - 1, day, hour, minute);
          if(!(myDate instanceof Date))
              return false;
          if(myDate.getTime() > now.getTime())
              return false;
      }
      else{
          const [year, month, day] = dateStr.split('/');
          const myDate = new Date(year, month - 1, day);
          if(!(myDate instanceof Date))
              return false;
          if(myDate.getTime() > now.getTime())
              return false;
      }
    }
  
    return true;
  }

function mailIsValid(str) {
    const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return regex.test(str);
}

function nameIsValid(str) {
  const regex = /^[A-Za-z]+$/;
  return regex.test(str);
}

function surnameIsValid(str) {
  const regex = /^[A-Za-z\s']+$/;
  return regex.test(str);
}

const validators = {rfidIsValid, posFieldIsValid, dateIsValid, positionIdIsValid, mailIsValid, nameIsValid, surnameIsValid}

module.exports = validators;